import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOrderResponse } from "@/lib/orders/order-lookup";
import { readJsonBodyWithinLimit } from "@/lib/request-body";

export const runtime = "nodejs";
const MAX_LOOKUP_BODY_SIZE = 4_096;

const fallbackLimits = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(request: Request) {
  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const clientHash = createHash("sha256").update(`order-lookup:${clientId}`).digest("hex");
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("consume_chat_rate_limit", {
      p_client_hash: clientHash,
      p_window_seconds: 60,
      p_limit: 8,
    });
    if (!error && typeof data === "boolean") return !data;
  } catch {
    // Keep the endpoint protected if the shared rate-limit store is unavailable.
  }

  const now = Date.now();
  const current = fallbackLimits.get(clientHash);
  if (!current || current.resetAt <= now) {
    fallbackLimits.set(clientHash, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  if (fallbackLimits.size > 2000) {
    for (const [key, limit] of fallbackLimits) if (limit.resetAt <= now) fallbackLimits.delete(key);
  }
  return current.count > 8;
}

export async function POST(request: Request) {
  if (await isRateLimited(request)) {
    return Response.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar." }, { status: 429 });
  }

  const parsedBody = await readJsonBodyWithinLimit(request, MAX_LOOKUP_BODY_SIZE);
  if (parsedBody.status === "too-large") {
    return Response.json({ error: "Permintaan terlalu besar." }, { status: 413 });
  }
  if (parsedBody.status === "invalid") {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
  const body = parsedBody.body;
  const orderId = typeof body === "object" && body !== null && "orderId" in body && typeof body.orderId === "string"
    ? body.orderId
    : "";

  return getOrderResponse(orderId);
}
