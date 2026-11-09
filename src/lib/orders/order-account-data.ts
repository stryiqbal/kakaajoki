import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ENCRYPTED_PREFIX = "encrypted:v1:";
const PASSWORD_FIELD_PATTERN = /(password|pass)/i;

function getEncryptionKey() {
  const secret = process.env.ORDER_ACCOUNT_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error("ORDER_ACCOUNT_ENCRYPTION_KEY must be configured with at least 32 characters.");
  }
  return createHash("sha256").update(secret).digest();
}

function encryptValue(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${ENCRYPTED_PREFIX}${iv.toString("base64url")}:${authTag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

function decryptValue(value: string) {
  const [ivValue, authTagValue, ciphertextValue] = value.slice(ENCRYPTED_PREFIX.length).split(":");
  if (!ivValue || !authTagValue || !ciphertextValue) {
    throw new Error("Encrypted account field is malformed.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function encryptSensitiveAccountData(accountData: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(accountData).map(([key, value]) => [
      key,
      PASSWORD_FIELD_PATTERN.test(key) ? encryptValue(value) : value,
    ]),
  );
}

export function decryptSensitiveAccountData(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (typeof item !== "string") return [key, ""];
      if (!PASSWORD_FIELD_PATTERN.test(key) || !item.startsWith(ENCRYPTED_PREFIX)) {
        return [key, item];
      }
      return [key, decryptValue(item)];
    }),
  );
}