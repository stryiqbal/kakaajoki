"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ClipboardPaste,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getOrderNumber, normalizeOrderId } from "@/lib/orders/order-id";
import { AnimatePresence, motion } from "motion/react";

type OrderStatus = {
  order_id: string;
  service_title: string;
  product_title: string;
  quantity: number;
  subtotal_amount: number;
  fee_amount: number;
  amount: number;
  payment_status: "pending_review" | "paid" | "rejected";
  account_status: "pending" | "processing" | "completed" | null;
  created_at: string;
};

async function findOrder(orderId: string) {
  const response = await fetch(
    "/api/orders/lookup",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }), cache: "no-store" },
  );
  const result = (await response.json()) as OrderStatus | { error?: string };
  if (!response.ok || !("payment_status" in result)) {
    throw new Error(
      "error" in result ? result.error : "Pesanan tidak ditemukan.",
    );
  }
  return result;
}

export default function CheckTransactionPage() {
  const [invoice, setInvoice] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!order) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [order]);

  function showError(message: string) {
    setError(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  }

  function clearError() {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = null;
    setError(null);
  }

  async function checkOrder(orderId: string) {
    setIsLoading(true);
    clearError();
    try {
      const result = await findOrder(orderId);
      setOrder(result);
      setInvoice(result.order_id);
    } catch (searchError) {
      setOrder(null);
      showError(
        searchError instanceof Error
          ? searchError.message
          : "Pesanan tidak ditemukan.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invoiceValue = invoice.trim();
    if (!invoiceValue) {
      setOrder(null);
      showError("Silahkan isi Nomor Order ID terlebih dahulu.");
      const invoiceInput = event.currentTarget.querySelector<HTMLInputElement>(
        "#invoice-number",
      );
      window.requestAnimationFrame(() => {
        invoiceInput?.focus({ preventScroll: true });
        invoiceInput?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    const orderId = normalizeOrderId(invoiceValue);
    if (!orderId) {
      setOrder(null);
      showError("Masukkan nomor orderan yang valid.");
      return;
    }
    await checkOrder(orderId);
  }

  async function handlePasteInvoice() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setInvoice(clipboardText.trim());
        clearError();
      }
    } catch {
      showError("Clipboard tidak dapat dibaca. Tempel nomor orderan secara manual.");
    }
  }

  const statusLabel = order
    ? order.payment_status === "paid"
      ? "Pembayaran Terverifikasi"
      : order.payment_status === "rejected"
        ? "Bukti Pembayaran Ditolak"
        : "Menunggu Verifikasi Admin"
    : null;

  return (
    <>
      <Navbar />
      <main className="page-background relative min-h-screen overflow-x-hidden border-t border-white/5 px-4 pb-24 pt-24 text-white sm:px-6 sm:pt-28">
        <section className="m-1 rounded-2xl border border-white/[0.06] bg-red-500/[0.035] px-4 py-10 sm:m-4 sm:rounded-3xl sm:py-14 md:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="mt-3 font-[var(--font-chakra)] text-2xl font-bold sm:text-3xl lg:text-4xl">
              Cek Orderan Kamu dengan Mudah dan Cepat
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
              Lihat detail pesanan kamu menggunakan Order ID.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 w-full max-w-xl rounded-xl border border-white/10 bg-[#151517]/95 p-4 text-left shadow-xl sm:p-6"
            >
              <h2 className="text-sm font-semibold text-white">
                Cari detail orderan kamu disini
              </h2>

              <div className="relative">
                <input
                  id="invoice-number"
                  autoComplete="off"
                  className="mb-2 mt-4 block h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  onChange={(event) => setInvoice(event.currentTarget.value)}
                  placeholder="Masukkan nomor Order ID (Contoh : KJ/XXXXXX/XXXX)"
                  value={invoice}
                />
                <button
                  type="button"
                  onClick={handlePasteInvoice}
                  aria-label="Tempel Order ID"
                  className="cursor-pointer absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <ClipboardPaste size={17} />
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : null}
                {isLoading ? "Mengecek..." : "Search"}
              </button>
            </form>
          </div>
        </section>

        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
                transition: { duration: 0.2, ease: "easeInOut" },
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 32,
                mass: 0.75,
              }}
              className="fixed left-1/2 top-24 z-[60] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-2xl"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                <X size={15} strokeWidth={3} aria-hidden="true" />
              </span>
              <p className="min-w-0 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

          <AnimatePresence>
            {order && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                onClick={(event) => {
                  if (event.target === event.currentTarget) setOrder(null);
                }}
              >
                <motion.section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="check-order-result-title"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="payment-modal-scrollbar flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-white/10 bg-[#111114] text-white shadow-2xl"
                >
                  <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#151517]/95 px-4 py-4 backdrop-blur sm:px-5">
                    <h2 id="check-order-result-title" className="text-base font-semibold">Hasil Pengecekan</h2>
                    <button
                      type="button"
                      onClick={() => setOrder(null)}
                      aria-label="Tutup hasil pengecekan"
                      className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={19} />
                    </button>
                  </header>
                  <div className="p-4 text-zinc-200 sm:p-5">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white">Kakaajoki</h3>
                    </div>
                    <div className="my-4 border-t border-white/15" />
                    <p className="text-center text-sm font-semibold">
                      Order No : <span className="font-mono">{getOrderNumber(order.order_id)}</span>
                    </p>
                    <div className="mt-4 flex flex-col gap-2 text-xs">
                      <p className="flex min-h-8 items-center break-all font-mono">Order ID : {order.order_id}</p>
                      <p className="flex min-h-8 items-center">
                        Tanggal : {new Intl.DateTimeFormat("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Jakarta",
                        }).format(new Date(order.created_at))}, {new Intl.DateTimeFormat("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hourCycle: "h23",
                          timeZone: "Asia/Jakarta",
                        }).format(new Date(order.created_at))}
                      </p>
                      <p className="flex min-h-8 items-center font-medium">{statusLabel}</p>
                    </div>
                    <div className="my-4 border-t border-white/15" />
                    <div className="flex flex-col gap-2 text-xs">
                      <p className="flex min-h-8 items-center">{order.service_title}</p>
                      <p className="flex min-h-8 items-center">{order.product_title}</p>
                      <p className="flex min-h-8 items-center">{order.quantity}x</p>
                      {order.payment_status === "paid" && order.account_status && (
                        <p className="flex min-h-8 items-center">
                          Status akun : {order.account_status === "completed"
                            ? "Selesai"
                            : order.account_status === "processing"
                              ? "Proses"
                              : "Pending"}
                        </p>
                      )}
                      <div className="flex min-h-8 items-center justify-between gap-4 border-t border-white/10 pt-2 text-sm font-bold">
                        <span>Total:</span>
                        <span className="text-right text-red-400">Rp {order.amount.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void checkOrder(order.order_id)}
                      disabled={isLoading}
                      className="cursor-pointer mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-60"
                    >
                      {isLoading ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                      Refresh
                    </button>
                  </div>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
