import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeOrderId } from "@/lib/orders/order-id";

export async function getOrderResponse(orderId: string) {
  const normalizedOrderId = normalizeOrderId(orderId);
  if (!normalizedOrderId) {
    return NextResponse.json({ error: "Nomor order tidak valid." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: "Penyimpanan order belum dikonfigurasi." }, { status: 503 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("order_id, service_title, product_title, quantity, unit_price, subtotal_amount, fee_amount, amount, payment_status, account_status, proof_path, created_at")
    .eq("order_id", normalizedOrderId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Order tidak dapat dimuat." }, { status: 502 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(
    {
      order_id: order.order_id,
      service_title: order.service_title,
      product_title: order.product_title,
      quantity: order.quantity,
      unit_price: order.unit_price,
      subtotal_amount: order.subtotal_amount,
      fee_amount: order.fee_amount,
      amount: order.amount,
      payment_status: order.payment_status,
      account_status: order.account_status,
      created_at: order.created_at,
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
