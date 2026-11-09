"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { Check, CircleAlert, Clipboard, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getOrderNumber } from "@/lib/orders/order-id";

export type CheckoutOrderDraft = {
  serviceTitle: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  contactPhone: string;
  accountData: Record<string, string>;
};

type SavedOrder = {
  order_id: string;
  service_title: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  subtotal_amount: number;
  fee_amount: number;
  amount: number;
  contact_phone: string;
  payment_status: "pending_review" | "paid" | "rejected";
  created_at: string;
};

export default function PaymentCheckoutModal({
  order,
  onClose,
}: {
  order: CheckoutOrderDraft;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"payment" | "uploading" | "success" | "preparing" | "receipt">("payment");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copyAlert, setCopyAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isOrderIdCopied, setIsOrderIdCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isDraggingProof, setIsDraggingProof] = useState(false);
  const [savedOrder, setSavedOrder] = useState<SavedOrder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const total = order.unitPrice * order.quantity;

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (step !== "success" && step !== "preparing") return;
    const timer = window.setTimeout(
      () => setStep(step === "success" ? "preparing" : "receipt"),
      step === "success" ? 1200 : 800,
    );
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (!copyAlert) return;
    const timer = window.setTimeout(() => setCopyAlert(null), 2400);
    return () => window.clearTimeout(timer);
  }, [copyAlert]);

  function selectProof(file: File | null) {
    setError("");
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (!file) {
      setProofFile(null);
      setProofPreview(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Pilih bukti transfer berupa JPG, PNG, atau WebP.");
      setProofFile(null);
      setProofPreview(null);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Ukuran bukti transfer maksimal 8 MB.");
      setProofFile(null);
      setProofPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setProofFile(file);
    setProofPreview(previewUrl);
  }

  function handleProofDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDraggingProof(true);
  }

  function handleProofDragLeave(event: DragEvent<HTMLElement>) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setIsDraggingProof(false);
  }

  function handleProofDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDraggingProof(false);
    selectProof(event.dataTransfer.files[0] ?? null);
  }

  async function submitProof() {
    if (!proofFile || isUploading) return;
    setError("");
    setIsUploading(true);
    setStep("uploading");

    const body = new FormData();
    body.append("order", JSON.stringify(order));
    body.append("proof", proofFile);

    try {
      const response = await fetch("/api/orders", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as {
        order?: SavedOrder;
        error?: string;
      };
      if (!response.ok || !result.order) {
        throw new Error(result.error ?? "Order belum dapat disimpan. Coba lagi.");
      }
      setSavedOrder(result.order);
      setStep("success");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Order belum dapat disimpan. Coba lagi.",
      );
      setStep("payment");
    } finally {
      setIsUploading(false);
    }
  }

  async function copyOrderId() {
    if (!savedOrder) return;
    setIsOrderIdCopied(false);
    try {
      await navigator.clipboard.writeText(savedOrder.order_id);
      setIsOrderIdCopied(true);
      window.setTimeout(() => setIsOrderIdCopied(false), 2000);
      setCopyAlert({ type: "success", message: "Berhasil disalin" });
    } catch {
      setCopyAlert({ type: "error", message: "Nomor order tidak dapat disalin. Silakan salin secara manual." });
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-4">
      {/* Kartu Utama (Pembayaran & Receipt) */}
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.99 }}
        className="payment-modal-scrollbar relative flex max-h-[calc(100dvh-1.5rem)] min-h-[min(70dvh,36rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-white/10 bg-[#111114] text-white shadow-2xl sm:max-h-[90dvh]"
      >
        {step !== "uploading" && step !== "success" && step !== "preparing" && (
          <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#151517]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <h2 id="checkout-title" className="truncate text-base font-semibold">
                {step === "payment" ? "Pembayaran" : "Order Receipt"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              aria-label="Tutup pembayaran"
              className="ml-3 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </header>
        )}

        <AnimatePresence mode="wait">
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="payment-modal-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              <div className="flex flex-col items-center text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Total Pembayaran</p>
                <p className="mt-3 font-[var(--font-chakra)] text-2xl font-bold text-red-400">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                <div className="mt-3 w-full max-w-[300px]">
                  <Image
                    src="/lainnya/Qr.jpeg"
                    alt="QRIS pembayaran Kakaa.Joki"
                    width={768}
                    height={1152}
                    unoptimized
                    className="h-auto w-full object-contain"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsProofModalOpen(true)}
                  className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-red-400 underline underline-offset-4 transition hover:text-red-300"
                >
                  <Upload size={16} />
                  Upload Bukti Transfer
                </button>

                <div className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-semibold text-zinc-200">
                  <CircleAlert size={16} className="text-zinc-200" />
                  Belum Dibayar
                </div>
              </div>
            </motion.div>
          )}

          {(step === "uploading" || step === "preparing") && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              role="status"
              aria-live="polite"
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6"
            >
              <LoaderCircle size={38} className="animate-spin text-white" />
              <p className="text-sm font-medium text-zinc-300">Loading...</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0.65, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="flex size-20 items-center justify-center rounded-full border border-white/30 bg-white/10"
              >
                <motion.svg viewBox="0 0 32 32" className="size-10 text-white" aria-hidden="true">
                  <motion.path
                    d="M7 16.5 13 22l12-13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.div>
              <h3 className="mt-5 text-lg font-semibold text-white">Order berhasil dibuat</h3>
            </motion.div>
          )}

          {step === "receipt" && savedOrder && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-1 flex-col p-4 sm:p-6"
            >
              <div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">Kakaajoki</h3>
                </div>
                <p className="mx-auto mt-2 max-w-sm text-center text-xs leading-5 text-zinc-400">
                  Note : Simpan Order ID/Screenshoot halaman ini. Order ID dapat digunakan untuk mengecek status pesanan.
                </p>
                <div className="my-4 border-t border-white/15" />
                <p className="text-center text-sm font-semibold text-zinc-200">
                  Order No: <span className="font-mono">{getOrderNumber(savedOrder.order_id)}</span>
                </p>
                <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-200">
                  <div className="flex min-h-8 items-center justify-between gap-2">
                    <p className="min-w-0 break-all font-mono">Order ID : {savedOrder.order_id}</p>
                    <button
                      type="button"
                      onClick={() => void copyOrderId()}
                      aria-label={isOrderIdCopied ? "Order ID berhasil disalin" : "Salin Order ID"}
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10"
                    >
                      {isOrderIdCopied ? <Check size={16} /> : <Clipboard size={16} />}
                    </button>
                  </div>
                  <p className="flex min-h-8 items-center">
                    Tanggal : {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(savedOrder.created_at))}, {new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hourCycle: "h23",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(savedOrder.created_at))}
                  </p>
                  <p className="flex min-h-8 items-center font-medium">
                    {savedOrder.payment_status === "paid"
                      ? "Lunas"
                      : savedOrder.payment_status === "rejected"
                        ? "Ditolak"
                        : "Menunggu verifikasi"}
                  </p>
                </div>
                <div className="my-4 border-t border-white/15" />
                <div className="flex flex-col gap-2 text-xs text-zinc-200">
                  <p className="flex min-h-8 items-center">{savedOrder.service_title}</p>
                  <p className="flex min-h-8 items-center">{savedOrder.product_title}</p>
                  <p className="flex min-h-8 items-center">{savedOrder.quantity}x</p>
                  <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-sm font-bold">
                    <p>Total:</p>
                    <p className="text-right text-red-400">Rp {savedOrder.amount.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>
              {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Kartu Modal Upload Bukti Transfer (Ukuran disamakan max-w-md) */}
      <AnimatePresence>
        {step === "payment" && isProofModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="proof-modal-title"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="payment-modal-scrollbar flex max-h-[90dvh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-white/10 bg-[#111114] text-white shadow-2xl"
            >
              <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#151517]/95 px-4 py-4 backdrop-blur sm:px-5">
                <div>
                  <h2 id="proof-modal-title" className="text-base font-semibold">Upload</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProofModalOpen(false)}
                  disabled={isUploading}
                  aria-label="Tutup unggah bukti"
                  className="ml-3 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </header>
              <div className="space-y-4 p-4 sm:p-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => selectProof(event.currentTarget.files?.[0] ?? null)}
                />
                <div
                  onDragOver={handleProofDragOver}
                  onDragLeave={handleProofDragLeave}
                  onDrop={handleProofDrop}
                  className={`rounded-lg ${isDraggingProof ? "ring-2 ring-red-500" : ""}`}
                >
                  {proofPreview ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                      <Image src={proofPreview} alt="Pratinjau bukti transfer" fill unoptimized className="object-contain" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Ganti gambar bukti"
                        className="absolute inset-0 cursor-pointer"
                      >
                        <span className="absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full bg-black/75 text-white">
                          <Upload size={16} />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.value = "";
                          selectProof(null);
                        }}
                        aria-label="Hapus gambar bukti"
                        className="absolute right-2 top-2 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-3 text-xs font-medium text-zinc-300 transition hover:border-white/40 hover:bg-white/[0.06]"
                    >
                      <Upload size={22} />
                      <span>JPG, PNG, atau WebP. Maksimal 8 MB.</span>
                    </button>
                  )}
                </div>
                {error && <p role="alert" className="text-xs leading-5 text-red-300">{error}</p>}
                <button
                  type="button"
                  disabled={!proofFile || isUploading}
                  onClick={() => void submitProof()}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isUploading && <LoaderCircle size={17} className="animate-spin" />}
                  {isUploading ? "Mengirim bukti..." : "Send"}
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {copyAlert && (
          <motion.div
            role={copyAlert.type === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.75 }}
            className="fixed left-1/2 top-6 z-[110] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-2xl"
          >
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-white ${copyAlert.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
              {copyAlert.type === "success" ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
            </span>
            <p className="min-w-0 font-medium">{copyAlert.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}