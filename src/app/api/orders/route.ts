import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { encryptSensitiveAccountData } from "@/lib/orders/order-account-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getJakartaDateKey } from "@/lib/orders/order-id";
import { getCatalogService } from "@/features/services/service-catalog";
import { ACCOUNT_FIELD_LABELS } from "@/features/services/account-field-labels";
import { isValidEmail, normalizeEmail } from "@/lib/admin/auth";

export const runtime = "nodejs";

const MAX_PROOF_SIZE = 8 * 1024 * 1024;
const STORAGE_BUCKET = "order-proofs";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 5;
const fallbackLimits = new Map<string, { count: number; resetAt: number }>();

async function readBodyWithinLimit(request: Request, maxBytes: number) {
  if (!request.body) return new ArrayBuffer(0);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bodyBuffer = new ArrayBuffer(totalBytes);
  const bodyBytes = new Uint8Array(bodyBuffer);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bodyBuffer;
}

async function isRateLimited(request: Request) {
  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const clientHash = createHash("sha256").update(`order-create:${clientId}`).digest("hex");

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("consume_chat_rate_limit", {
      p_client_hash: clientHash,
      p_window_seconds: RATE_LIMIT_WINDOW_MS / 1000,
      p_limit: RATE_LIMIT_REQUESTS,
    });
    if (!error && typeof data === "boolean") return !data;
  } catch {
    // Keep a local limit when the shared rate-limit store is unavailable.
  }

  const now = Date.now();
  const current = fallbackLimits.get(clientHash);
  if (!current || current.resetAt <= now) {
    fallbackLimits.set(clientHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  if (fallbackLimits.size > 2000) {
    for (const [key, limit] of fallbackLimits) {
      if (limit.resetAt <= now) fallbackLimits.delete(key);
    }
  }
  return current.count > RATE_LIMIT_REQUESTS;
}

export async function GET() {
  return NextResponse.json({ error: "Gunakan Order ID dan nomor WhatsApp untuk mencari pesanan." }, { status: 405 });
}

function isSupportedImage(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

function cleanAccountData(value: unknown, allowedKeys: string[]) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const allowedKeySet = new Set(allowedKeys);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) =>
        allowedKeySet.has(key) &&
        typeof item === "string" &&
        item.trim() &&
        !/(otp|secret)/i.test(key),
      )
      .slice(0, 30)
      .map(([key, item]) => [key, (item as string).trim().slice(0, 500)]),
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function removeUploadedProof(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  proofPath: string,
  orderId: string,
) {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([proofPath]);
    if (error) {
      console.error("Failed to clean up proof for order", { orderId });
    }
  } catch {
    console.error("Failed to clean up proof for order", { orderId });
  }
}

async function notifyAdminsOfNewOrder(order: {
  order_id: string;
  service_title: string;
  product_title: string;
  quantity: number;
  amount: number;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const recipients = [...new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(isValidEmail),
  )];

  if (!apiKey || !from || recipients.length === 0) {
    console.error("Admin order email is not configured", { orderId: order.order_id });
    return;
  }

  const text = [
    "A new order has been received.",
    "",
    `Order ID: ${order.order_id}`,
    `Service: ${order.service_title}`,
    `Product: ${order.product_title}`,
    `Quantity: ${order.quantity}`,
    `Total: Rp ${order.amount.toLocaleString("id-ID")}`,
  ].join("\n");
  const html = `<div style="margin:0; padding:0; font-family:Arial, sans-serif; color:#222; font-size:14px; line-height:1.6; text-align:left;">
  <p style="margin:0 0 14px;">Dear Admin,</p>
  <p style="margin:0 0 10px;">A new order has been received:</p>
  <p style="margin:0 0 10px;">Order ID:</p>
  <p style="margin:0 0 22px; font-size:24px; font-weight:bold; letter-spacing:4px;">${escapeHtml(order.order_id)}</p>
  <p style="margin:0 0 18px;">
    Service: ${escapeHtml(order.service_title)}<br>
    Product: ${escapeHtml(order.product_title)}<br>
    Quantity: ${order.quantity}<br>
    Total: Rp ${order.amount.toLocaleString("id-ID")}
  </p>
  <hr style="margin:0 0 20px; border:0; border-top:1px solid #ddd;">
  <p style="margin:0; color:#888; font-size:12px;">Kakaajoki</p>
  <hr style="margin:0 0 20px; border:0; border-top:1px solid #ddd;">
</div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: `New order received: ${order.order_id}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Admin order email could not be sent", {
        orderId: order.order_id,
        status: response.status,
      });
    }
  } catch {
    console.error("Admin order email request failed", { orderId: order.order_id });
  }
}

export async function POST(request: Request) {
  const maxRequestSize = MAX_PROOF_SIZE + 128 * 1024;
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader === null ? null : Number(contentLengthHeader);
  if (
    contentLength !== null &&
    (!Number.isSafeInteger(contentLength) || contentLength < 0 || contentLength > maxRequestSize)
  ) {
    return NextResponse.json({ error: "Ukuran bukti maksimal 8 MB." }, { status: 413 });
  }
  if (await isRateLimited(request)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan order. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } },
    );
  }

  let bodyBuffer: ArrayBuffer | null;
  try {
    bodyBuffer = await readBodyWithinLimit(request, maxRequestSize);
  } catch {
    return NextResponse.json({ error: "Form order tidak valid." }, { status: 400 });
  }
  if (bodyBuffer === null) {
    return NextResponse.json({ error: "Ukuran bukti maksimal 8 MB." }, { status: 413 });
  }

  let formData: FormData;
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType) throw new Error("Missing content type");

    const boundedRequest = new Request(request.url, {
      method: "POST",
      headers: { "content-type": contentType },
      body: bodyBuffer,
    });
    formData = await boundedRequest.formData();
  } catch {
    return NextResponse.json({ error: "Form order tidak valid." }, { status: 400 });
  }

  const orderValue = formData.get("order");
  const proof = formData.get("proof");
  if (typeof orderValue !== "string" || !(proof instanceof File)) {
    return NextResponse.json({ error: "Detail order dan bukti transfer wajib diisi." }, { status: 400 });
  }
  if (proof.size < 1 || proof.size > MAX_PROOF_SIZE) {
    return NextResponse.json({ error: "Ukuran bukti transfer harus maksimal 8 MB." }, { status: 400 });
  }
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(proof.type)) {
    return NextResponse.json({ error: "Bukti harus berupa gambar JPG, PNG, atau WebP." }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(orderValue);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Invalid order payload");
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Detail order tidak valid." }, { status: 400 });
  }

  const serviceTitle = typeof payload.serviceTitle === "string" ? payload.serviceTitle.trim().slice(0, 160) : "";
  const productTitle = typeof payload.productTitle === "string" ? payload.productTitle.trim().slice(0, 160) : "";
  const contactPhone = typeof payload.contactPhone === "string" ? payload.contactPhone.trim().slice(0, 32) : "";
  const quantity = Number(payload.quantity);
  const unitPrice = Number(payload.unitPrice);
  const serviceConfig = getCatalogService(serviceTitle);
  const catalogPrice = serviceConfig?.nominalGroups
    .flatMap((group) => group.options)
    .find((option) => option.title === productTitle)?.price ?? null;
  if (
    !serviceTitle ||
    !serviceConfig ||
    !productTitle ||
    !/^\+?[\d\s()-]{7,32}$/.test(contactPhone) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 1000 ||
    !Number.isSafeInteger(unitPrice) ||
    catalogPrice === null ||
    unitPrice !== catalogPrice ||
    unitPrice < 0 ||
    unitPrice > 1_000_000_000
  ) {
    return NextResponse.json({ error: "Detail order atau kontak tidak valid." }, { status: 400 });
  }

  const accountFieldKeys = serviceConfig.accountFields.map(
    (field) => ACCOUNT_FIELD_LABELS[field.name] ?? field.name,
  );
  const accountData = cleanAccountData(payload.accountData, accountFieldKeys);
  const requiredAccountFieldKeys = serviceConfig.accountFields
    .filter((field) => field.required)
    .map((field) => ACCOUNT_FIELD_LABELS[field.name] ?? field.name);
  if (
    !accountData ||
    requiredAccountFieldKeys.some((key) => !accountData[key]?.trim())
  ) {
    return NextResponse.json({ error: "Data akun wajib belum lengkap." }, { status: 400 });
  }

  const bytes = new Uint8Array(await proof.arrayBuffer());
  if (!isSupportedImage(bytes, proof.type)) {
    return NextResponse.json({ error: "File yang dipilih bukan gambar yang valid." }, { status: 400 });
  }

  const subtotalAmount = unitPrice * quantity;
  if (!Number.isSafeInteger(subtotalAmount)) {
    return NextResponse.json({ error: "Total order tidak valid." }, { status: 400 });
  }

  let encryptedAccountData: Record<string, string>;
  try {
    encryptedAccountData = encryptSensitiveAccountData(accountData);
  } catch {
    return NextResponse.json({ error: "Enkripsi data akun belum dikonfigurasi." }, { status: 503 });
  }

  const extension = proof.type === "image/jpeg" ? "jpg" : proof.type === "image/png" ? "png" : "webp";
  const supabase = (() => {
    try {
      return createSupabaseAdminClient();
    } catch {
      return null;
    }
  })();

  if (!supabase) {
    return NextResponse.json({ error: "Penyimpanan order belum dikonfigurasi." }, { status: 503 });
  }

  const { data: nextOrderNumber, error: orderNumberError } = await supabase.rpc("next_order_number");
  const orderNumber = Number(nextOrderNumber);
  if (orderNumberError || !Number.isSafeInteger(orderNumber) || orderNumber < 1) {
    return NextResponse.json({ error: "Nomor order belum dapat dibuat. Coba lagi." }, { status: 502 });
  }

  const orderId = `KJ/${getJakartaDateKey()}/${String(orderNumber).padStart(4, "0")}`;
  const proofPath = `${orderId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(proofPath, bytes, { contentType: proof.type, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: "Bukti transfer belum dapat disimpan. Coba lagi." }, { status: 502 });
  }

  const order = {
    order_id: orderId,
    service_title: serviceTitle,
    product_title: productTitle,
    quantity,
    unit_price: unitPrice,
    subtotal_amount: subtotalAmount,
    fee_amount: 0,
    amount: subtotalAmount,
    contact_phone: contactPhone,
    account_data: encryptedAccountData,
    proof_path: proofPath,
    payment_status: "pending_review",
  };

  try {
    const { data, error: insertError } = await supabase
      .from("orders")
      .insert(order)
      .select("order_id, service_title, product_title, quantity, unit_price, subtotal_amount, fee_amount, amount, contact_phone, payment_status, created_at")
      .single();

    if (!insertError && data) {
      await notifyAdminsOfNewOrder(data);
      return NextResponse.json({ order: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
  } catch {}

  console.error("Order insert failed or returned no order", { orderId });
  try {
    const { data: existingOrder, error: lookupError } = await supabase
      .from("orders")
      .select("order_id, service_title, product_title, quantity, unit_price, subtotal_amount, fee_amount, amount, contact_phone, payment_status, created_at")
      .eq("order_id", orderId)
      .maybeSingle();

    if (lookupError) {
      console.error("Could not verify order after insert failure", { orderId });
      return NextResponse.json({ error: "Order belum dapat disimpan. Coba lagi." }, { status: 502 });
    }
    if (existingOrder) {
      await notifyAdminsOfNewOrder(existingOrder);
      return NextResponse.json({ order: existingOrder }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
  } catch {
    console.error("Order verification raised an exception", { orderId });
    return NextResponse.json({ error: "Order belum dapat disimpan. Coba lagi." }, { status: 502 });
  }

  await removeUploadedProof(supabase, proofPath, orderId);
  return NextResponse.json({ error: "Order belum dapat disimpan. Coba lagi." }, { status: 502 });
}
