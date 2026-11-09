import { NextResponse } from "next/server";
import {
  isAdminEmail,
  normalizeEmail,
} from "@/lib/admin/auth";
import { decryptSensitiveAccountData } from "@/lib/orders/order-account-data";
import { normalizeOrderId } from "@/lib/orders/order-id";
import { readJsonBodyWithinLimit } from "@/lib/request-body";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const ORDERS_PAGE_SIZE = 25;
const MAX_STATUS_UPDATE_BODY_SIZE = 4_096;
const ORDER_SERVICE_TITLES = [
  "Mobile Legends Rank",
  "Mobile Legends MMR",
  "Mobile Legends Classic",
  "Mabar / Gendong Mobile Legends",
  "Mobile Legends Rising League",
  "Mobile Legends Video Montage",
  "Magic Chess Go Go",
  "Magic Chess Go Go MMR",
] as const;

async function getAdminClient() {
  const sessionClient = await createSupabaseServerClient();
  const { data, error } = await sessionClient.auth.getClaims();
  const email = typeof data?.claims?.email === "string"
    ? normalizeEmail(data.claims.email)
    : null;

  if (error || !isAdminEmail(email)) return null;
  return createSupabaseAdminClient();
}

export async function GET(request: Request) {
  try {
    const supabase = await getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Sesi admin tidak valid." }, { status: 401 });
    }

    const proofOrderId = new URL(request.url).searchParams.get("proofOrderId");
    if (proofOrderId !== null) {
      const normalizedOrderId = normalizeOrderId(proofOrderId);
      if (!normalizedOrderId) {
        return NextResponse.json({ error: "Order tidak valid." }, { status: 400 });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("proof_path")
        .eq("order_id", normalizedOrderId)
        .maybeSingle();
      if (orderError) {
        return NextResponse.json({ error: "Bukti transfer belum dapat dimuat." }, { status: 502 });
      }
      if (!order?.proof_path) {
        return NextResponse.json({ error: "Bukti transfer tidak ditemukan." }, { status: 404 });
      }

      const { data: proof, error: proofError } = await supabase.storage
        .from("order-proofs")
        .createSignedUrl(order.proof_path, 60 * 10);
      if (proofError || !proof?.signedUrl) {
        return NextResponse.json({ error: "Bukti transfer belum dapat dimuat." }, { status: 502 });
      }

      return NextResponse.json(
        { proofUrl: proof.signedUrl },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }

    const revenueMonth = new URL(request.url).searchParams.get("revenueMonth");
    if (revenueMonth !== null) {
      const monthMatch = /^(\d{4})-(\d{2})$/.exec(revenueMonth);
      const year = monthMatch ? Number(monthMatch[1]) : 0;
      const month = monthMatch ? Number(monthMatch[2]) : 0;
      if (!monthMatch || year < 2000 || month < 1 || month > 12) {
        return NextResponse.json({ error: "Bulan revenue tidak valid." }, { status: 400 });
      }

      const jakartaOffsetMs = 7 * 60 * 60 * 1000;
      const startAt = new Date(Date.UTC(year, month - 1, 1) - jakartaOffsetMs).toISOString();
      const endAt = new Date(Date.UTC(year, month, 1) - jakartaOffsetMs).toISOString();
      const requestedHistoryPage = new URL(request.url).searchParams.get("historyPage") ?? "1";
      const parsedHistoryPage = /^\d+$/.test(requestedHistoryPage)
        ? Number(requestedHistoryPage)
        : 1;
      const historyPage = Number.isSafeInteger(parsedHistoryPage) && parsedHistoryPage > 0
        ? Math.min(parsedHistoryPage, 1_000_000)
        : 1;
      const historyPageSize = 20;
      const [dailyResult, lifetimeRevenueResult, historyResult] = await Promise.all([
        supabase.rpc("get_monthly_paid_revenue_daily", {
          p_start: startAt,
          p_end: endAt,
        }),
        supabase.rpc("get_lifetime_paid_revenue"),
        supabase
          .from("orders")
          .select("order_id, service_title, product_title, amount, paid_at", { count: "exact" })
          .eq("payment_status", "paid")
          .not("paid_at", "is", null)
          .gte("paid_at", startAt)
          .lt("paid_at", endAt)
          .order("paid_at", { ascending: false })
          .range((historyPage - 1) * historyPageSize, historyPage * historyPageSize - 1),
      ]);

      if (dailyResult.error || historyResult.error || lifetimeRevenueResult.error) {
        return NextResponse.json({ error: "Revenue belum dapat dimuat." }, { status: 502 });
      }

      const dailyRows = (dailyResult.data ?? []) as Array<{
        paid_day: string;
        total_amount: number | string;
        order_count: number | string;
      }>;
      const dailyTotals = dailyRows.map((day) => ({
        day: day.paid_day,
        amount: Number(day.total_amount),
        orderCount: Number(day.order_count),
      }));

      return NextResponse.json(
        {
          month: revenueMonth,
          totalRevenue: dailyTotals.reduce<number>((total, day) => total + day.amount, 0),
          allTimeRevenue: Number(lifetimeRevenueResult.data ?? 0),
          paidOrderCount: dailyTotals.reduce<number>((total, day) => total + day.orderCount, 0),
          dailyTotals,
          history: historyResult.data ?? [],
          historyTotal: historyResult.count ?? 0,
          historyPage,
          historyPageSize,
        },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }

    if (new URL(request.url).searchParams.get("summary") === "true") {
      const unfinishedByService = await Promise.all(
        ORDER_SERVICE_TITLES.map(async (serviceTitle) => {
          const [pendingReview, inProgress] = await Promise.all([
            supabase
              .from("orders")
              .select("order_id", { count: "exact", head: true })
              .eq("service_title", serviceTitle)
              .eq("payment_status", "pending_review"),
            supabase
              .from("orders")
              .select("order_id", { count: "exact", head: true })
              .eq("service_title", serviceTitle)
              .eq("payment_status", "paid")
              .or("account_status.is.null,account_status.neq.completed"),
          ]);

          return {
            serviceTitle,
            count: (pendingReview.count ?? 0) + (inProgress.count ?? 0),
            hasError: Boolean(pendingReview.error || inProgress.error),
          };
        }),
      );

      if (unfinishedByService.some((service) => service.hasError)) {
        return NextResponse.json({ error: "Ringkasan order belum dapat dimuat." }, { status: 502 });
      }

      const unfinishedOrdersByService = Object.fromEntries(
        unfinishedByService.map(({ serviceTitle, count }) => [serviceTitle, count]),
      );
      const unfinishedOrderCount = unfinishedByService.reduce(
        (total, service) => total + service.count,
        0,
      );

      return NextResponse.json(
        { unfinishedOrderCount, unfinishedOrdersByService },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }

    const searchParams = new URL(request.url).searchParams;
    const requestedPage = searchParams.get("page") ?? "1";
    const pageNumber = /^\d+$/.test(requestedPage) ? Number(requestedPage) : 1;
    const page = Number.isSafeInteger(pageNumber) && pageNumber > 0
      ? Math.min(pageNumber, 1_000_000)
      : 1;
    const workspace = searchParams.get("workspace");
    const service = searchParams.get("service");
    const paymentStatus = searchParams.get("paymentStatus");
    const accountStatus = searchParams.get("accountStatus");
    const search = (searchParams.get("search") ?? "")
      .trim()
      .slice(0, 100)
      .replace(/[^a-zA-Z0-9/+\s-]/g, "");

    let ordersQuery = supabase
      .from("orders")
      .select("order_id, service_title, product_title, quantity, unit_price, subtotal_amount, fee_amount, amount, contact_phone, account_data, payment_status, account_status, proof_path, created_at", { count: "exact" });

    if (workspace === "Mobile Legends") {
      ordersQuery = ordersQuery.not("service_title", "like", "Magic Chess%");
    } else if (workspace === "Magic Chess") {
      ordersQuery = ordersQuery.like("service_title", "Magic Chess%");
    }
    if (service && service !== "all") ordersQuery = ordersQuery.eq("service_title", service);
    if (paymentStatus === "pending_review" || paymentStatus === "paid" || paymentStatus === "rejected") {
      ordersQuery = ordersQuery.eq("payment_status", paymentStatus);
    }
    if (accountStatus === "inactive") {
      ordersQuery = ordersQuery.is("account_status", null);
    } else if (accountStatus === "pending" || accountStatus === "processing" || accountStatus === "completed") {
      ordersQuery = ordersQuery.eq("account_status", accountStatus);
    }
    if (search) {
      ordersQuery = ordersQuery.or(
        `order_id.ilike.%${search}%,service_title.ilike.%${search}%,product_title.ilike.%${search}%,contact_phone.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await ordersQuery
      .order("created_at", { ascending: false })
      .order("order_id", { ascending: false })
      .range((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: "Daftar order belum dapat dimuat." }, { status: 502 });
    }

    const orders = (data ?? []).map((order) => ({
          order_id: order.order_id,
          service_title: order.service_title,
          product_title: order.product_title,
          quantity: order.quantity,
          unit_price: order.unit_price,
          subtotal_amount: order.subtotal_amount,
          fee_amount: order.fee_amount,
          amount: order.amount,
          contact_phone: order.contact_phone,
          account_data: decryptSensitiveAccountData(order.account_data),
          payment_status: order.payment_status,
          account_status: order.account_status,
          created_at: order.created_at,
          has_proof: Boolean(order.proof_path),
        }));

    return NextResponse.json(
      {
        orders,
        total: count ?? 0,
        page,
        pageSize: ORDERS_PAGE_SIZE,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json({ error: "Penyimpanan order belum dikonfigurasi." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  let supabase;
  try {
    supabase = await getAdminClient();
  } catch {
    return NextResponse.json({ error: "Penyimpanan order belum dikonfigurasi." }, { status: 503 });
  }
  if (!supabase) {
    return NextResponse.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  }

  const parsedBody = await readJsonBodyWithinLimit(request, MAX_STATUS_UPDATE_BODY_SIZE);
  if (parsedBody.status === "too-large") {
    return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413 });
  }
  if (parsedBody.status === "invalid") {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
  const body = parsedBody.body;

  if (
    typeof body !== "object" ||
    body === null ||
    !("orderId" in body) ||
    !("field" in body) ||
    !("status" in body)
  ) {
    return NextResponse.json({ error: "Order dan status wajib diisi." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? normalizeOrderId(body.orderId) : null;
  const field = body.field;
  const status = body.status;
  if (
    !orderId ||
    (field !== "payment_status" && field !== "account_status")
  ) {
    return NextResponse.json({ error: "Order atau status tidak valid." }, { status: 400 });
  }

  if (
    (field === "payment_status" &&
      status !== "pending_review" && status !== "paid" && status !== "rejected") ||
    (field === "account_status" &&
      status !== "pending" && status !== "processing" && status !== "completed")
  ) {
    return NextResponse.json({ error: "Status order tidak valid." }, { status: 400 });
  }

  try {
    const { data: currentOrder, error: currentOrderError } = await supabase
      .from("orders")
      .select("payment_status, account_status, paid_at")
      .eq("order_id", orderId)
      .maybeSingle();
    if (currentOrderError) {
      return NextResponse.json({ error: "Order belum dapat dimuat." }, { status: 502 });
    }
    if (!currentOrder) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    if (field === "account_status" && currentOrder.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Status akun baru bisa diatur setelah pembayaran dikonfirmasi." },
        { status: 409 },
      );
    }

    const updatedAt = new Date().toISOString();
    const update = field === "payment_status"
      ? {
          payment_status: status,
          account_status: status === "paid"
            ? currentOrder.payment_status === "paid"
              ? currentOrder.account_status ?? "pending"
              : "pending"
            : null,
          paid_at: status === "paid"
            ? currentOrder.payment_status === "paid"
              ? currentOrder.paid_at ?? updatedAt
              : updatedAt
            : null,
          updated_at: updatedAt,
        }
      : { account_status: status, updated_at: updatedAt };

    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("order_id", orderId)
      .select("order_id, payment_status, account_status")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Status order belum dapat diperbarui." }, { status: 502 });
    }
    if (!data) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Penyimpanan order belum dikonfigurasi." }, { status: 503 });
  }
}
