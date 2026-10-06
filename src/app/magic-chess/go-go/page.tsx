"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Gift,
  Headphones,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ServiceHero from "@/components/ServiceHero";
import { AnimatePresence, motion } from "motion/react";

const inputClassName =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white placeholder:text-zinc-500 outline-none transition focus:border-red-400 focus:ring-1 focus:ring-red-400";

type NominalOption = {
  id: string;
  title: string;
  price: number;
  imageSrc: string;
};

const NOMINAL_OPTIONS: NominalOption[] = [
  { 
    id: "gm", 
    title: "Grandmaster / 4 Bintang", 
    price: 2000, 
    imageSrc: "/rank/Grandmaster.png" 
  },
  { 
    id: "epic", 
    title: "Epic / 4 Bintang", 
    price: 4000, 
    imageSrc: "/rank/Epic.png" 
  },
  { 
    id: "legend", 
    title: "Legend / 4 Bintang", 
    price: 6000, 
    imageSrc: "/rank/Legend.png" 
  },
  { 
    id: "mythic", 
    title: "Mythic / 4 Bintang", 
    price: 10000, 
    imageSrc: "/rank/Mythic.png" 
  },
  { 
    id: "honor", 
    title: "Mythic Honor / 4 Bintang", 
    price: 16000, 
    imageSrc: "/rank/Mythic Honor.png" 
  },
  { 
    id: "glory", 
    title: "Mythic Glory / 4 Bintang", 
    price: 20000, 
    imageSrc: "/rank/Mythic Glory.png" 
  },
];

function OrderSection({
  id,
  number,
  title,
  children,
}: {
  id?: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 overflow-hidden rounded-xl border border-white/10 bg-[#151517]/90 shadow-xl">
      <div className="flex items-center border-b border-white/10 bg-white/[0.03]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-600 text-xs font-bold text-white">
          {number}
        </span>
        <h2 className="px-4 text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default function MagicChessGoGoOrderPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<"transaction" | "details">("transaction");
  const [selectedNominal, setSelectedNominal] = useState<NominalOption | null>(null);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const [hoveredNominalId, setHoveredNominalId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCSModalOpen, setIsCSModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rawTotal = selectedNominal ? selectedNominal.price * (quantity || 0) : 0;

  useEffect(() => () => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
  }, []);

  function showValidationAlert(message: string, sectionId: string) {
    setAlertMessage(message);
    setActiveTab("transaction");
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage(null);
      alertTimeoutRef.current = null;
    }, 5000);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertMessage(null);

    const formData = new FormData(event.currentTarget);
    const requiredAccountFields = [
      "loginVia", 
      "userId", 
      "accountId", 
      "password"
    ];
    const hasMissingAccountData = requiredAccountFields.some(
      (fieldName) => String(formData.get(fieldName) ?? "").trim() === ""
    );

    if (hasMissingAccountData) {
      showValidationAlert("Silahkan isi data akun terlebih dahulu.", "account-section");
      return;
    }
    if (!selectedNominal) {
      showValidationAlert("Silahkan pilih nominal yang ingin dibeli terlebih dahulu.", "nominal-section");
      return;
    }
    if (quantity === "" || quantity < 1) {
      showValidationAlert("Jumlah minimal adalah 1.", "quantity-section");
      return;
    }

    const details = [
      ["Layanan", "Joki Magic Chess: Go Go"],
      ["Paket", selectedNominal.title],
      ["Harga", `Rp ${selectedNominal.price.toLocaleString("id-ID")}`],
      ["Jumlah Pembelian", `${quantity}`],
      ["Total Pembayaran", `Rp ${rawTotal.toLocaleString("id-ID")}`],
    ];
    const accountDetails = [
      ["Login Via", formData.get("loginVia")],
      ["User ID & Nickname", formData.get("userId")],
      ["Email/No. HP/Moonton ID", formData.get("accountId")],
      ["Password", formData.get("password")],
      ["Catatan Untuk Penjoki", formData.get("notes") || "Tidak ada"],
    ];

    const message = [
      "Halo Kakaa.Joki! Saya ingin order *Joki Magic Chess: Go Go*.",
      "",
      "*RINGKASAN PESANAN*",
      ...details.map(([label, value]) => `- *${label}:* ${value}`),
      "",
      "*DATA AKUN*",
      ...accountDetails.map(([label, value]) => `- *${label}:* ${value}`),
      "",
      "Mohon konfirmasi pesanan dan estimasi prosesnya ya. Terima kasih!",
    ].join("\n");

    window.open(
      `https://wa.me/6288706392829?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <Navbar />

      <ServiceHero
        imageSrc="/magicchess/Joki%20MCGG.png?v=20261001"
        imageAlt="Magic Chess: Go Go"
        eyebrow="Magic Chess: Go Go"
        title="Joki Magic Chess Go Go"
      />

      <AnimatePresence>
        {alertMessage && (
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
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.75 }}
            className="fixed left-1/2 top-24 z-[60] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-2xl"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
              <X size={15} strokeWidth={3} />
            </span>
            <p className="min-w-0 font-medium">{alertMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(237,16,27,0.12),_transparent_35%),linear-gradient(180deg,#0a0a0a_0%,#111214_100%)] px-4 pb-4 pt-4 text-white sm:px-6 sm:pt-6 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-center rounded-xl border border-white/10 bg-[#151517]/80 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Gift className="h-4 w-4 shrink-0 text-red-500" />
              <span>ORDER 40 BINTANG FREE 4 BINTANG</span>
            </div>
          </div>

          {/* Navigation & Mobile Tabs */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Mobile Tab Switcher */}
            <div className="flex w-full rounded-xl bg-white/[0.04] p-1 lg:hidden sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("transaction")}
                className={`flex-1 rounded-lg px-4 py-1.5 text-xs cursor-pointer font-semibold transition ${
                  activeTab === "transaction"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Transaksi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex-1 rounded-lg px-4 py-1.5 cursor-pointer text-xs font-semibold transition ${
                  activeTab === "details"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Keterangan
              </button>
            </div>
          </div>

          <form
            ref={formRef}
            onSubmit={submitOrder}
            noValidate
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
          >
            {/* Left Content (Form on Transaction Tab) */}
            <div
              className={`space-y-5 ${
                activeTab === "transaction" ? "block" : "hidden lg:block"
              }`}
            >
              {/* Seksi 1: Masukkan Data Akun */}
              <OrderSection id="account-section" number="1" title="Masukkan Data Akun">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-300">
                      Login Via
                    </span>
                    <select
                      className={`${inputClassName} cursor-pointer`}
                      name="loginVia"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled className="bg-zinc-900 text-white">
                        Pilih Login Via
                      </option>
                      <option value="Moonton" className="bg-zinc-900 text-white">
                        Moonton
                      </option>
                      <option value="VK" className="bg-zinc-900 text-white">
                        VK
                      </option>
                      <option value="TikTok" className="bg-zinc-900 text-white">
                        TikTok
                      </option>
                      <option value="Facebook" className="bg-zinc-900 text-white">
                        Facebook
                      </option>
                      <option value="Google Play" className="bg-zinc-900 text-white">
                        Google Play
                      </option>
                      <option value="WhatsApp" className="bg-zinc-900 text-white">
                        WhatsApp
                      </option>
                      <option value="Telegram" className="bg-zinc-900 text-white">
                        Telegram
                      </option>
                    </select>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-300">
                      User ID & Nick Name
                    </span>
                    <input
                      className={inputClassName}
                      name="userId"
                      placeholder="Masukkan User ID & Nick Name"
                      required
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-300">
                      Email/No. Hp/Moonton ID
                    </span>
                    <input
                      className={inputClassName}
                      name="accountId"
                      placeholder="Masukkan Email/No. Hp/Moonton ID"
                      required
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-300">
                      Password
                    </span>
                    <span className="relative block">
                      <input
                        className={`${inputClassName} pr-11`}
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Masukkan Password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        className="cursor-pointer absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 transition hover:text-white"
                        aria-label={isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"}
                        aria-pressed={isPasswordVisible}
                      >
                        {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </span>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-zinc-300">
                      Catatan Untuk Penjoki
                    </span>
                    <input
                      className={inputClassName}
                      name="notes"
                      placeholder="Masukkan Catatan Untuk Penjoki"
                    />
                  </label>
                </div>

                <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.08] p-3 text-xs italic leading-5 text-zinc-300">
                  <Info size={15} className="mt-0.5 shrink-0 text-red-400" />
                  Please make sure you fill the correct account data
                </p>
              </OrderSection>

              {/* Seksi 2: Pilih Nominal */}
              <OrderSection id="nominal-section" number="2" title="Pilih Nominal">
                <div className="space-y-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Joki Magic Chess / 40 Point (4 Bintang)
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                    {NOMINAL_OPTIONS.map((item) => {
                      const isSelected = selectedNominal?.id === item.id;
                      const isHovered = hoveredNominalId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedNominal(item)}
                          onMouseEnter={() => setHoveredNominalId(item.id)}
                          onMouseLeave={() => setHoveredNominalId(null)}
                          onFocus={() => setHoveredNominalId(item.id)}
                          onBlur={() => setHoveredNominalId(null)}
                          style={{
                            transform: isHovered
                             ? "translateY(-4px) scale(1.02)" 
                             : "translateY(0) scale(1)",
                            boxShadow: isHovered
                             ? "0 12px 30px rgba(239, 68, 68, 0.18)"
                             : undefined,
                            borderColor: isHovered
                             ? "rgba(239, 68, 68, 0.55)" 
                             : undefined,
                            transition:
                             "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                          }}
                          className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-2 text-left sm:p-3.5 ${
                            isSelected
                              ? "border-red-500 bg-red-500/10 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex w-full min-w-0 flex-col gap-2">
                            <div className="flex min-w-0 items-start justify-between gap-1.5">
                              <p className="min-w-0 text-xs font-medium leading-4 text-zinc-200">
                                {item.title}
                              </p>
                              {isSelected && (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <Image
                                src={item.imageSrc}
                                alt={`${item.title.split(" /")[0]} rank`}
                                width={52}
                                height={52}
                                loading="eager"
                                style={{
                                  transform: isHovered
                                    ? "scale(1.1)"
                                    : "scale(1)",
                                  transition: "transform 180ms ease",
                                }}
                                className="h-9 w-9 shrink-0 object-contain sm:h-12 sm:w-12"
                              />
                              <p className="min-w-0 text-xs font-bold text-red-400 sm:text-sm">
                                Rp {item.price.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </OrderSection>

              {/* Seksi 3: Masukkan Jumlah Pembelian */}
              <OrderSection id="quantity-section" number="3" title="Masukkan Jumlah Pembelian">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={quantity}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setQuantity(value === "" ? "" : Math.max(1, Number(value)));
                    }}
                    className={`${inputClassName} flex-1 text-sm font-semibold`}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => (prev === "" ? 1 : prev + 1))}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-600 font-bold text-white transition hover:bg-red-500 active:scale-95"
                    aria-label="Tambah jumlah"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    disabled={quantity === "" || quantity <= 1}
                    onClick={() => setQuantity((prev) => (prev === "" ? 1 : Math.max(1, prev - 1)))}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.1] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus size={18} />
                  </button>
                </div>
              </OrderSection>
            </div>

            {/* Desktop & Mobile Sticky Sidebar */}
            <aside
              className={`space-y-4 lg:sticky lg:top-24 ${
                activeTab === "transaction" ? "block" : "hidden lg:block"
              }`}
            >
              {/* Butuh Bantuan Button */}
              <button
                type="button"
                onClick={() => setIsCSModalOpen(true)}
                className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl border border-white/10 bg-[#151517] p-4 text-left shadow-xl transition hover:border-red-500/40 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <Headphones size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Butuh Bantuan?</h4>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Kamu bisa hubungi admin disini.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsInfoModalOpen(true)}
                className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl border border-white/10 bg-[#151517] p-4 text-left shadow-xl transition hover:border-red-500/40 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <Info size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Klik Untuk Melihat Informasi</h4>
                  <p className="mt-0.5 text-xs text-zinc-400">Baca catatan sebelum melakukan order.</p>
                </div>
              </button>

              {/* Ringkasan Order Card */}
              <div className="hidden rounded-xl border border-white/10 bg-[#151517] p-5 shadow-xl lg:block">
                {!selectedNominal ? (
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-zinc-400">
                    Belum ada item produk yang dipilih.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={selectedNominal.imageSrc}
                          alt={selectedNominal.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs font-bold text-white">
                          Joki Magic Chess GO GO
                        </h3>
                        <p className="truncate text-[11px] text-zinc-400">
                          {selectedNominal.title}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Harga</span>
                        <span className="font-semibold text-white">
                          Rp {selectedNominal.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Jumlah Pembelian</span>
                        <span className="font-semibold text-white">{quantity === "" ? "-" : `${quantity}`}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Biaya Layanan</span>
                        <span className="font-semibold text-white">Rp 0</span>
                      </div>
                    </div>

                    <div className="my-4 border-b border-white/10" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Total Pembayaran</span>
                      <span className="font-[var(--font-chakra)] text-base font-bold text-red-400">
                        Rp {rawTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="mt-5 hidden min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:scale-95 lg:inline-flex"
                >
                  <ShoppingBag size={16} />
                  <span>Pesan Sekarang!</span>
                </button>
              </div>
            </aside>
          </form>

          {/* Tab Keterangan (Desktop displayed below, Mobile switched via activeTab) */}
          <div
            className={`space-y-8 lg:mt-10 pb-4 lg:pb-0 ${
              activeTab === "details" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Seksi Deskripsi Produk */}
            <section className="rounded-xl border border-white/10 bg-[#151517] p-4 shadow-xl sm:p-6">
              <h2 className="border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-wider text-white sm:text-base">
                Deskripsi Joki Magic Chess Go Go
              </h2>
              <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-zinc-300">
                <p>
                  <strong>Joki Magic Chess Solusi Cepat Naik Rank Magic Chess!</strong>
                </p>
                <p>
                  Kami mempersembahkan layanan joki Magic Chess yang cepat,
                  murah, serta aman dan terpercaya! Tingkatkan permainan dan
                  rank Anda dengan bantuan dari profesional kami. Kami
                  mengutamakan kepuasan dan keamanan akun Anda dalam setiap jasa
                  yang kami berikan.
                </p>
                <div>
                  <p className="font-semibold text-white">Waktu Pengecekan Orderan:</p>
                  <p className="text-zinc-400">
                    Orderan yang sudah dibayarkan akan kami cek setiap hari 24
                    jam terkecuali admin tidur.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <p className="font-semibold text-white">Berikut adalah langkah-langkah sederhana untuk Order Jasa Joki :</p>
                    <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-zinc-300">
                      <li>Lengkapi Data Akun Joki Dengan Teliti (Pastikan data yang Anda masukkan sudah benar dan lengkap)</li>
                      <li>Pilih Jenis Variant Joki (Sesuaikan dengan kebutuhan Anda)</li>
                      <li>Masukkan Jumlah Order Sesuai Tujuan Rank (Pastikan jumlah order sesuai dengan rank yang Anda inginkan dan sesuai dengan S&amp;K)</li>
                      <li>Klik Order Now &amp; Lakukan Pembayaran (Tunggu konfirmasi dari kami dan orderan Anda akan segera diproses)</li>
                    </ol>
                  </div>
                <div>
                  <p className="font-semibold text-white">Estimasi Waktu Proses:</p>
                  <p className="text-zinc-400">
                    Kami berkomitmen untuk menyelesaikan jasa joki Anda dalam
                    waktu 12-48 jam. Waktu penyelesaian dapat bervariasi
                    tergantung pada jumlah dan kompleksitas pesanan. Kami
                    berupaya untuk memberikan layanan secepat mungkin.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Floating Bottom Bar on Mobile */}
      {activeTab === "transaction" && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-white/10 bg-[#151517]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          {selectedNominal ? (
            <>
              <button
                type="button"
                onClick={() => setIsOrderSummaryExpanded((expanded) => !expanded)}
                aria-expanded={isOrderSummaryExpanded}
                className="flex w-full items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-left"
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={selectedNominal.imageSrc}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-white">Joki Magic Chess GO GO</span>
                  <span className="block truncate text-[11px] text-zinc-400">{selectedNominal.title}</span>
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-zinc-300 cursor-pointer transition-transform ${isOrderSummaryExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isOrderSummaryExpanded && (
                <div className="space-y-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Harga</span>
                    <span className="text-white">Rp {selectedNominal.price.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Jumlah Pembelian</span>
                    <span className="text-white">{quantity === "" ? "-" : quantity}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Biaya Layanan</span>
                    <span className="text-white">Rp 0</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-white">
                    <span>Total Pembayaran</span>
                    <span className="text-red-400">Rp {rawTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-12 items-center justify-center rounded-lg border border-dashed border-white/10 px-3 text-center text-xs text-zinc-400">
              Belum ada item produk yang dipilih.
            </div>
          )}
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className="inline-flex h-10 w-full items-center cursor-pointer justify-center gap-2 rounded-lg bg-red-600 px-5 text-xs font-bold text-white shadow-lg transition hover:bg-red-500 active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>Pesan Sekarang!</span>
          </button>
        </div>
      )}

      {/* Modal Customer Service */}
      {isCSModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsCSModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#151517] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsCSModalOpen(false)}
              className="cursor-pointer absolute right-4 top-4 text-zinc-400 transition hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="mb-5 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Headphones size={24} />
              </div>
              <h3 className="text-base font-bold text-white">Customer Service</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Hubungi kami jika ada pertanyaan atau kendala seputar pesanan.
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href="https://wa.me/6288706392829"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/kakaa.joki"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@kakaa.joki"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                TikTok
              </a>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCSModalOpen(false)}
                className="w-full rounded-lg cursor-pointer border border-white/10 bg-white/[0.05] py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfoModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-information-title"
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#151517] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 id="order-information-title" className="text-base font-bold text-white">
                  Informasi dan Syarat Order
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Mohon luangkan waktu untuk membaca catatan Informasi sebelum melakukan pemesanan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Tutup informasi"
              >
                <X size={18} />
              </button>
            </header>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 text-xs leading-relaxed text-zinc-300">
              <section>
                <h3 className="font-bold text-white">Waktu Pengecekan Orderan</h3>
                <p className="mt-1">
                  Orderan yang sudah dibayarkan akan kami cek setiap hari selama 24 jam, kecuali saat admin tidur.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-white">Berikut Syarat dan Ketentuan Sebelum Order Jasa Joki</h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-red-400">
                  <li><strong className="text-zinc-100">Data Akun:</strong> Lengkapi data dengan benar, termasuk kapitalisasi huruf.</li>
                  <li><strong className="text-zinc-100">Verifikasi Akun:</strong> Nonaktifkan untuk mempermudah login.</li>
                  <li><strong className="text-zinc-100">Tipe Akun:</strong> Utamakan akun utama, bukan akun beli atau bekas GB, untuk menghindari BAN.</li>
                  <li><strong className="text-zinc-100">Login Tanpa Izin:</strong> Berakibat pembatalan joki dan pembayaran hangus.</li>
                  <li><strong className="text-zinc-100">Kesabaran:</strong> Tunggu sesuai estimasi dan jangan spam chat admin.</li>
                  <li><strong className="text-zinc-100">Masalah Login:</strong> Admin/Bot akan menghubungi jika ada kendala.</li>
                  <li><strong className="text-zinc-100">Keterlambatan Proses:</strong> Hubungi kami jika order belum diproses dalam 1 hari.</li>
                  <li><strong className="text-zinc-100">Setelah Joki Selesai:</strong> Jika belum menerima laporan dari Admin/Bot, jangan login terlebih dahulu karena ada benefit bonus.</li>
                  <li><strong className="text-zinc-100">Tanggung Jawab Pasca-Joki:</strong> Tanggung jawab atas akun berakhir setelah joki selesai.</li>
                  <li><strong className="text-zinc-100">Konfirmasi Selesai:</strong> Admin/Bot akan menghubungi, dan customer dapat mengecek melalui WhatsApp.</li>
                </ol>
              </section>

              <p className="border-t border-white/10 pt-4 font-semibold text-white">
                Jika butuh bantuan, harap hubungi Admin. Terima kasih.
              </p>
            </div>
          </section>
        </div>
      )}

      <Footer />
      {activeTab === "transaction" && (
        <div
          aria-hidden="true"
          className={`lg:hidden ${isOrderSummaryExpanded ? "h-60" : "h-30"}`}
        />
      )}
    </>
  );
}