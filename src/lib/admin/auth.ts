import { NextResponse } from "next/server";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hasConfiguredAdminEmails() {
  return Boolean(
    process.env.ADMIN_EMAILS?.split(",").some((email) => isValidEmail(email.trim())),
  );
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return allowedEmails.includes(normalizeEmail(email));
}

export function adminAuthResponse(payload: { email?: string; error?: string; ok?: boolean }, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Expires: "0",
      Pragma: "no-cache",
    },
  });
}