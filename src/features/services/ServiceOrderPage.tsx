"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  Gift,
  Globe,
  HandCoins,
  Headphones,
  Info,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import { createPortal } from "react-dom";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  type CountryIso2,
} from "react-international-phone";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentCheckoutModal, {
  type CheckoutOrderDraft,
} from "@/features/services/PaymentCheckoutModal";
import { ACCOUNT_FIELD_LABELS } from "@/features/services/account-field-labels";

function isValidContactPhone(value: string) {
  return isValidPhoneNumber(value);
}

export type ServiceNominalOption = {
  id: string;
  title: string;
  price: number;
  imageSrc: string;
};

export type ServiceNominalGroup = {
  title: string;
  options: ServiceNominalOption[];
};

export type ServiceAccountField = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "url" | "password" | "select";
  selectPlaceholder?: string;
  options?: { label: string; value: string }[];
};

export type ServicePageConfig = {
  serviceName: string;
  summaryTitle: string;
  hero: {
    imageSrc: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
  };
  promoText: string;
  accountFields: ServiceAccountField[];
  nominalGroups: ServiceNominalGroup[];
  description: {
    title: string;
    headline: string;
    body: string;
    orderGoal: string;
  };
};

const inputClassName =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white placeholder:text-zinc-500 outline-none transition focus:border-red-400 focus:ring-1 focus:ring-red-400";

const loginOptions = [
  { label: "Moonton", value: "Moonton" },
  { label: "VK", value: "VK" },
  { label: "TikTok", value: "TikTok" },
  { label: "Facebook", value: "Facebook" },
  { label: "Google Play", value: "Google Play" },
  { label: "WhatsApp", value: "WhatsApp" },
  { label: "Telegram", value: "Telegram" },
];

const countries = defaultCountries.map(parseCountry);

function ServiceHero({
  bannerSrc = "/lainnya/Banner%20Order.png",
  imageSrc,
  imageAlt,
  eyebrow,
  title,
}: ServicePageConfig["hero"] & { bannerSrc?: string }) {
  return (
    <div className="relative w-full pt-[68px]">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden">
        <Image
          src={bannerSrc}
          alt="Banner info layanan"
          width={2048}
          height={750}
          priority
          unoptimized
          className="block h-auto w-full"
        />
      </div>

      <div className="border-b border-white/10 bg-[#151517]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
          <div className="relative -mt-14 h-36 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-[#1c1c1f] shadow-2xl sm:-mt-20 sm:h-48 sm:w-36 md:-mt-24 md:h-56 md:w-44">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              unoptimized
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
              className="object-cover"
            />
          </div>

          <div className="flex-1 py-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
              {eyebrow}
            </p>
            <h1 className="mt-1 font-[var(--font-chakra)] uppercase text-xl font-bold sm:text-2xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <HandCoins size={14} className="text-red-400" /> Mahal? Nego
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} className="text-red-400" /> Open 24/7 (Off
                Tidur)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap size={14} className="text-red-400" /> Fast Process
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-red-400" /> No Ribet
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactDetailsSection() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState<CountryIso2 | null>("id");
  const [dialCodeDraft, setDialCodeDraft] = useState("62");
  const [nationalNumber, setNationalNumber] = useState("");
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const contactSectionRef = useRef<HTMLElement>(null);
  const selectedCountryRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const country = countryCode
    ? (countries.find((item) => item.iso2 === countryCode) ?? null)
    : null;

  useEffect(() => {
    if (!isCountryPickerOpen) return;

    searchInputRef.current?.focus();

    function handleOutsideClick(event: MouseEvent) {
      if (!contactSectionRef.current?.contains(event.target as Node)) {
        setIsCountryPickerOpen(false);
        setCountrySearch("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCountryPickerOpen(false);
        setCountrySearch("");
        selectedCountryRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCountryPickerOpen]);

  const normalizedSearch = countrySearch.trim().toLowerCase();
  const filteredCountries = countries.filter((item) =>
    `${item.name} ${item.dialCode} ${item.iso2}`
      .toLowerCase()
      .includes(normalizedSearch),
  );

  function updateCombinedNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 15);
    if (!digits) {
      setDialCodeDraft("");
      setNationalNumber("");
      setCountryCode(null);
      setPhone("");
      return;
    }

    const selectedCountry = countryCode
      ? countries.find((item) => item.iso2 === countryCode)
      : null;
    if (
      selectedCountry &&
      nationalNumber &&
      !digits.startsWith(selectedCountry.dialCode) &&
      digits.startsWith(nationalNumber)
    ) {
      setCountryCode(null);
      setDialCodeDraft("");
      setNationalNumber(digits);
      setPhone("");
      return;
    }

    const matchingDialCodes = [
      ...new Set(countries.map((item) => item.dialCode)),
    ]
      .filter((code) => digits.startsWith(code))
      .sort((left, right) => right.length - left.length);
    const nextDialCode = matchingDialCodes[0];
    if (!nextDialCode) {
      setCountryCode(null);
      setDialCodeDraft(digits);
      setNationalNumber("");
      setPhone("");
      return;
    }

    const matchingCountries = countries.filter(
      (item) => item.dialCode === nextDialCode,
    );
    const nextNationalNumber = digits.slice(nextDialCode.length);
    const parsedCountryCode = nextNationalNumber
      ? parsePhoneNumberFromString(`+${digits}`)?.country?.toLowerCase()
      : undefined;
    const parsedCountry = parsedCountryCode
      ? matchingCountries.find((item) => item.iso2 === parsedCountryCode)
      : undefined;
    const currentCountry = matchingCountries.find(
      (item) => item.iso2 === countryCode,
    );
    const nextCountry =
      parsedCountry ??
      currentCountry ??
      (matchingCountries.length === 1 ? matchingCountries[0] : null);

    setCountryCode(nextCountry?.iso2 ?? null);
    setDialCodeDraft(nextDialCode);
    setNationalNumber(nextNationalNumber);
    setPhone(nextCountry && nextNationalNumber ? `+${digits}` : "");
  }

  return (
    <section
      ref={contactSectionRef}
      id="contact-section"
      className={`relative ${isCountryPickerOpen ? "z-40" : "z-10"} scroll-mt-28 rounded-xl border border-white/10 bg-[#151517]/90 shadow-xl`}
    >
      <div className="flex items-center rounded-t-xl border-b border-white/10 bg-white/[0.03]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-600 text-xs font-bold text-white">
          4
        </span>
        <h2 className="px-4 text-xs font-bold uppercase text-white sm:text-sm">
          Detail Kontak
        </h2>
      </div>
      <div className="p-4 sm:p-5">
        <div className="block space-y-2">
          <label
            htmlFor="contact-phone-number"
            className="block text-xs font-medium text-zinc-300"
          >
            No. WhatsApp
          </label>
          <div className="international-phone-field">
            <button
              ref={selectedCountryRef}
              type="button"
              className="international-country-trigger"
              aria-label={
                country
                  ? `Pilih negara, saat ini ${country.name}`
                  : "Pilih negara"
              }
              aria-haspopup="listbox"
              aria-expanded={isCountryPickerOpen}
              aria-controls="contact-country-list"
              onClick={() => setIsCountryPickerOpen((open) => !open)}
            >
              {country ? (
                <FlagImage iso2={country.iso2} size="1.35rem" />
              ) : (
                <Globe size={18} aria-hidden="true" />
              )}
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            <div className="international-phone-combined">
              <input
                id="contact-phone-number"
                aria-label="Kode negara dan nomor WhatsApp"
                aria-describedby="contact-phone-note contact-phone-help"
                autoComplete="tel"
                className="international-phone-number"
                inputMode="numeric"
                maxLength={15}
                onChange={(event) =>
                  updateCombinedNumber(event.currentTarget.value)
                }
                placeholder=""
                required
                type="tel"
                value={`${dialCodeDraft}${nationalNumber}`}
              />
            </div>

            {isCountryPickerOpen && (
              <div className="international-country-menu">
                <label className="international-country-search">
                  <Search size={16} aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={countrySearch}
                    onChange={(event) =>
                      setCountrySearch(event.currentTarget.value)
                    }
                    placeholder="Cari negara atau kode..."
                    aria-label="Cari negara atau kode telepon"
                  />
                </label>
                <ul
                  id="contact-country-list"
                  role="listbox"
                  aria-label="Daftar negara"
                >
                  {filteredCountries.map((item) => (
                    <li key={item.iso2} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={item.iso2 === country?.iso2}
                        className="international-country-option"
                        onClick={() => {
                          setCountryCode(item.iso2);
                          setDialCodeDraft(item.dialCode);
                          setPhone(
                            nationalNumber
                              ? `+${item.dialCode}${nationalNumber}`
                              : "",
                          );
                          setIsCountryPickerOpen(false);
                          setCountrySearch("");
                          selectedCountryRef.current?.focus();
                        }}
                      >
                        <FlagImage iso2={item.iso2} size="1.35rem" />
                        <span className="international-country-name">
                          {item.name}
                        </span>
                        <span className="international-country-dial">
                          +{item.dialCode}
                        </span>
                        {item.iso2 === country?.iso2 && (
                          <Check size={15} aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                  {filteredCountries.length === 0 && (
                    <li className="international-country-empty">
                      Negara tidak ditemukan.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <input type="hidden" name="contactPhone" value={phone} />
          <span
            id="contact-phone-note"
            className="block text-xs italic text-zinc-400"
          >
            Nomor ini akan dihubungi jika terjadi masalah.
          </span>
        </div>

        {phone && !isValidContactPhone(phone) && (
          <p role="alert" className="mt-2 text-xs text-red-300">
            Masukkan nomor WhatsApp yang valid untuk negara pilihan.
          </p>
        )}

        <p
          id="contact-phone-help"
          className="mt-4 flex items-start gap-2 rounded-lg bg-black/25 p-3 text-xs leading-5 text-zinc-300"
        >
          <Info size={16} className="mt-0.5 shrink-0 text-zinc-300" />
          <span>
            Pastikan nomor WhatsApp benar, agar kami bisa menghubungi jika
            transaksi bermasalah. Tulis tanpa angka 0 di depan. Contoh: 8960xxxx
          </span>
        </p>
      </div>
    </section>
  );
}

function ServiceHelpInfo() {
  const [isCSModalOpen, setIsCSModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    if (!isCSModalOpen && !isInfoModalOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [isCSModalOpen, isInfoModalOpen]);

  return (
    <>
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
          <h4 className="text-xs font-bold text-white">
            Klik Untuk Melihat Informasi
          </h4>
          <p className="mt-0.5 text-xs text-zinc-400">
            Baca catatan sebelum melakukan order.
          </p>
        </div>
      </button>

      {isCSModalOpen && typeof document !== "undefined" && createPortal(
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
              aria-label="Tutup customer service"
              className="absolute right-4 top-4 cursor-pointer text-zinc-400 transition hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="mb-5 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Headphones size={24} />
              </div>
              <h3 className="text-base font-bold text-white">
                Customer Service
              </h3>
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
                href="https://www.instagram.com/kakaajoki"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@kakaajoki"
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
                className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.05] py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {isInfoModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-information-title"
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#151517] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2
                  id="service-information-title"
                  className="text-base font-bold text-white"
                >
                  Informasi dan Syarat Order
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Mohon luangkan waktu untuk membaca catatan Informasi sebelum
                  melakukan pemesanan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Tutup informasi"
              >
                <X size={18} />
              </button>
            </header>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 text-xs leading-relaxed text-zinc-300">
              <section>
                <h3 className="font-bold text-white">
                  Waktu Pengecekan Orderan
                </h3>
                <p className="mt-1">
                  Orderan yang sudah dibayarkan akan kami cek setiap hari selama
                  24 jam, kecuali saat admin tidur.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-white">
                  Berikut Syarat dan Ketentuan Sebelum Order Jasa Joki
                </h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-red-400">
                  <li>
                    <strong className="text-zinc-100">Data Akun:</strong>{" "}
                    Lengkapi data dengan benar, termasuk kapitalisasi huruf.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Verifikasi Akun:</strong>{" "}
                    Nonaktifkan untuk mempermudah login.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Tipe Akun:</strong>{" "}
                    Utamakan akun utama, bukan akun beli atau bekas GB, untuk
                    menghindari BAN.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Login Tanpa Izin:</strong>{" "}
                    Berakibat pembatalan joki dan pembayaran hangus.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Kesabaran:</strong> Tunggu
                    sesuai estimasi dan jangan spam chat admin.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Masalah Login:</strong>{" "}
                    Admin/Bot akan menghubungi jika ada kendala.
                  </li>
                  <li>
                    <strong className="text-zinc-100">
                      Keterlambatan Proses:
                    </strong>{" "}
                    Hubungi kami jika order belum diproses dalam 1 hari.
                  </li>
                  <li>
                    <strong className="text-zinc-100">
                      Setelah Joki Selesai:
                    </strong>{" "}
                    Jika belum menerima laporan dari Admin/Bot, jangan login
                    terlebih dahulu karena ada benefit bonus.
                  </li>
                  <li>
                    <strong className="text-zinc-100">
                      Tanggung Jawab Pasca-Joki:
                    </strong>{" "}
                    Tanggung jawab atas akun berakhir setelah joki selesai.
                  </li>
                  <li>
                    <strong className="text-zinc-100">
                      Konfirmasi Selesai:
                    </strong>{" "}
                    Admin/Bot akan menghubungi, dan customer dapat mengecek
                    melalui WhatsApp.
                  </li>
                </ol>
              </section>

              <p className="border-t border-white/10 pt-4 font-semibold text-white">
                Jika butuh bantuan, harap hubungi Admin. Terima kasih.
              </p>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

type ServiceTab = "transaction" | "details";

function ServiceTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ServiceTab;
  onTabChange: (tab: ServiceTab) => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full rounded-xl bg-white/[0.04] p-1 lg:hidden sm:w-auto">
        <button
          type="button"
          onClick={() => onTabChange("transaction")}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
            activeTab === "transaction"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Transaksi
        </button>
        <button
          type="button"
          onClick={() => onTabChange("details")}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
            activeTab === "details"
              ? "bg-red-600 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Keterangan
        </button>
      </div>
    </div>
  );
}

function ServiceValidationAlert({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
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
            <X size={15} strokeWidth={3} />
          </span>
          <p className="min-w-0 font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuantitySelector({
  value,
  onValueChange,
}: {
  value: number | "";
  onValueChange: (value: number | "") => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        step={1}
        required
        value={value}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onValueChange(
            nextValue === "" ? "" : Math.max(1, Number(nextValue)),
          );
        }}
        className="h-10 w-full flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-white placeholder:text-zinc-500 outline-none transition focus:border-red-400 focus:ring-1 focus:ring-red-400"
      />
      <button
        type="button"
        onClick={() => onValueChange(value === "" ? 1 : value + 1)}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-600 font-bold text-white transition hover:bg-red-500 active:scale-95"
        aria-label="Tambah jumlah"
      >
        <Plus size={18} />
      </button>
      <button
        type="button"
        disabled={value === "" || value <= 1}
        onClick={() =>
          onValueChange(value === "" ? 1 : Math.max(1, value - 1))
        }
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.1] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        aria-label="Kurangi jumlah"
      >
        <Minus size={18} />
      </button>
    </div>
  );
}

function OrderSection({
  id,
  number,
  title,
  children,
}: {
  id?: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-xl border border-white/10 bg-[#151517]/90 shadow-xl"
    >
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

function OrderSummaryDetails({
  variant,
  price,
  quantity,
  fee,
  total,
}: {
  variant: "desktop" | "mobile";
  price: number;
  quantity: number | "";
  fee: number;
  total: number;
}) {
  const isDesktop = variant === "desktop";
  const formattedQuantity = quantity === "" ? "-" : quantity;
  const formatPrice = (amount: number) => amount.toLocaleString("id-ID");
  const rows = [
    { label: "Harga", value: `Rp ${formatPrice(price)}` },
    { label: "Jumlah Pembelian", value: formattedQuantity },
    { label: "Biaya Layanan", value: `Rp ${formatPrice(fee)}` },
  ];

  return (
    <div
      className={
        isDesktop
          ? "mt-4 space-y-2.5 border-t border-white/10 pt-4 text-xs"
          : "space-y-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs"
      }
    >
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-zinc-400">
          <span>{row.label}</span>
          <span className={isDesktop ? "font-semibold text-white" : "text-white"}>
            {row.value}
          </span>
        </div>
      ))}

      {isDesktop ? (
        <>
          <div className="my-4 border-b border-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Total Pembayaran
            </span>
            <span className="font-[var(--font-chakra)] text-base font-bold text-red-400">
              Rp {formatPrice(total)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-white">
          <span>Total Pembayaran</span>
          <span className="text-red-400">Rp {formatPrice(total)}</span>
        </div>
      )}
    </div>
  );
}

function NominalOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: ServiceNominalOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{
        transform: isHovered
          ? "translateY(-4px) scale(1.02)"
          : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? "0 12px 30px rgba(239, 68, 68, 0.18)"
          : undefined,
        borderColor: isHovered ? "rgba(239, 68, 68, 0.55)" : undefined,
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
            {option.title}
          </p>
          {isSelected && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
              <Check size={12} />
            </span>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={option.imageSrc}
            alt={`${option.title.split(" /")[0]} rank`}
            width={52}
            height={52}
            loading="eager"
            style={{
              transform: isHovered ? "scale(1.1)" : "scale(1)",
              transition: "transform 180ms ease",
            }}
            className="h-9 w-9 shrink-0 object-contain sm:h-12 sm:w-12"
          />
          <p className="min-w-0 text-xs font-bold text-red-400 sm:text-sm">
            Rp {option.price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </button>
  );
}

function AccountField({ field }: { field: ServiceAccountField }) {
  const options = field.name === "loginVia" ? loginOptions : field.options ?? [];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-zinc-300">
        {field.label}
      </span>
      {field.type === "select" ? (
        <select
          className={`${inputClassName} cursor-pointer`}
          name={field.name}
          defaultValue=""
          required={field.required}
        >
          <option value="" disabled className="bg-zinc-900 text-white">
            {field.selectPlaceholder ?? field.placeholder ?? `Pilih ${field.label}`}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-zinc-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "password" ? (
        <div className="relative">
          <input
            className={`${inputClassName} pr-11`}
            name={field.name}
            placeholder={field.placeholder}
            type={isPasswordVisible ? "text" : "password"}
            required={field.required}
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      ) : (
        <input
          className={inputClassName}
          name={field.name}
          placeholder={field.placeholder}
          type={field.type ?? "text"}
          required={field.required}
        />
      )}
    </label>
  );
}

function ServiceDescription({
  description,
}: {
  description: ServicePageConfig["description"];
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#151517] p-5 shadow-xl sm:p-6">
      <h2 className="border-b border-white/10 pb-3 text-sm font-bold uppercase tracking-wider text-white sm:text-base">
        {description.title}
      </h2>
      <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-zinc-300">
        <p>
          <strong>{description.headline}</strong>
        </p>
        <p>{description.body}</p>
        <div>
          <p className="font-semibold text-white">Waktu Pengecekan Orderan:</p>
          <p className="text-zinc-400">
            Orderan yang sudah dibayarkan akan kami cek setiap hari 24 jam terkecuali admin tidur.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="font-semibold text-white">
            Berikut adalah langkah-langkah sederhana untuk Order Jasa Joki :
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-zinc-300">
            <li>
              Lengkapi Data Akun Joki Dengan Teliti (Pastikan data yang Anda masukkan sudah benar dan lengkap)
            </li>
            <li>Pilih Jenis Variant Joki (Sesuaikan dengan kebutuhan Anda)</li>
            <li>{description.orderGoal}</li>
            <li>
              Klik Order Now &amp; Lakukan Pembayaran (Tunggu konfirmasi dari kami dan orderan Anda akan segera diproses)
            </li>
          </ol> 
        </div>
        <div>
          <p className="font-semibold text-white">Estimasi Waktu Proses:</p>
          <p className="text-zinc-400">
            Kami berkomitmen untuk menyelesaikan jasa joki Anda dalam waktu 12-48 jam. Waktu penyelesaian dapat bervariasi tergantung pada jumlah dan kompleksitas pesanan. Kami berupaya untuk memberikan layanan secepat mungkin.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ServiceOrderPage({
  config,
}: {
  config: ServicePageConfig;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<ServiceTab>("transaction");
  const [selectedNominal, setSelectedNominal] =
    useState<ServiceNominalOption | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<CheckoutOrderDraft | null>(null);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const [contactResetKey, setContactResetKey] = useState(0);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rawTotal = selectedNominal
    ? selectedNominal.price * (quantity || 0)
    : 0;

  useEffect(
    () => () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    },
    [],
  );

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
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function resetOrderForm() {
    formRef.current?.reset();
    setSelectedNominal(null);
    setQuantity(1);
    setIsOrderSummaryExpanded(false);
    setContactResetKey((currentKey) => currentKey + 1);
    setAlertMessage(null);
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertMessage(null);

    const formData = new FormData(event.currentTarget);
    const contactPhone = String(formData.get("contactPhone") ?? "").trim();
    const hasMissingAccountData = config.accountFields
      .filter((field) => field.required)
      .some((field) => String(formData.get(field.name) ?? "").trim() === "");

    if (hasMissingAccountData) {
      showValidationAlert(
        "Silahkan isi data akun terlebih dahulu.",
        "account-section",
      );
      return;
    }
    if (!selectedNominal) {
      showValidationAlert(
        "Silahkan pilih nominal yang ingin dibeli terlebih dahulu.",
        "nominal-section",
      );
      return;
    }
    if (quantity === "" || quantity < 1) {
      showValidationAlert("Jumlah minimal adalah 1.", "quantity-section");
      return;
    }
    if (!contactPhone) {
      showValidationAlert(
        "Nomor WhatsApp tidak boleh kosong",
        "contact-section",
      );
      return;
    }
    if (!isValidContactPhone(contactPhone)) {
      showValidationAlert(
        "Masukkan nomor WhatsApp yang valid untuk negara pilihan.",
        "contact-section",
      );
      return;
    }

    const accountData = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key, value]) =>
          key !== "contactPhone" &&
          !/(otp|secret)/i.test(key) &&
          String(value).trim() !== "",
        )
        .map(([key, value]) => [
          ACCOUNT_FIELD_LABELS[key] ?? key,
          String(value).trim(),
        ]),
    );
    setPaymentOrder({
      serviceTitle: config.serviceName,
      productTitle: selectedNominal.title,
      quantity,
      unitPrice: selectedNominal.price,
      contactPhone,
      accountData,
    });
    resetOrderForm();
  }

  return (
    <>
      <Navbar />
      <ServiceHero {...config.hero} />
      <ServiceValidationAlert message={alertMessage} />

      {paymentOrder && (
        <PaymentCheckoutModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
        />
      )}

      <main className="page-background min-h-screen px-4 pb-4 pt-4 text-white sm:px-6 sm:pt-6 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-center rounded-xl border border-white/10 bg-[#151517]/80 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Gift className="h-4 w-4 shrink-0 text-red-500" />
              <span>{config.promoText}</span>
            </div>
          </div>

          <ServiceTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <form
            ref={formRef}
            onSubmit={submitOrder}
            noValidate
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
          >
            <div
              className={`space-y-5 ${
                activeTab === "transaction" ? "block" : "hidden lg:block"
              }`}
            >
              <OrderSection
                id="account-section"
                number="1"
                title="Masukkan Data Akun"
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {config.accountFields.map((field) => (
                    <AccountField key={field.name} field={field} />
                  ))}
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.08] p-3 text-xs italic leading-5 text-zinc-300">
                  <Info size={15} className="mt-0.5 shrink-0 text-red-400" />
                  Please make sure you fill the correct account data
                </p>
              </OrderSection>

              <OrderSection
                id="nominal-section"
                number="2"
                title="Pilih Nominal"
              >
                <div className="space-y-6">
                  {config.nominalGroups.map((group) => (
                    <div key={group.title} className="space-y-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {group.title}
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                        {group.options.map((option) => (
                          <NominalOptionCard
                            key={option.id}
                            option={option}
                            isSelected={selectedNominal?.id === option.id}
                            onSelect={() => setSelectedNominal(option)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </OrderSection>

              <OrderSection
                id="quantity-section"
                number="3"
                title="Masukkan Jumlah Pembelian"
              >
                <QuantitySelector
                  value={quantity}
                  onValueChange={setQuantity}
                />
              </OrderSection>
              <ContactDetailsSection key={contactResetKey} />
            </div>

            <aside
              className={`space-y-4 lg:sticky lg:top-24 ${
                activeTab === "transaction" ? "block" : "hidden lg:block"
              }`}
            >
              <ServiceHelpInfo />
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
                          {config.summaryTitle}
                        </h3>
                        <p className="truncate text-[11px] text-zinc-400">
                          {selectedNominal.title}
                        </p>
                      </div>
                    </div>
                    <OrderSummaryDetails
                      variant="desktop"
                      price={selectedNominal.price}
                      quantity={quantity}
                      fee={0}
                      total={rawTotal}
                    />
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

          <div
            className={`space-y-8 pb-4 lg:pb-0 lg:mt-10 ${
              activeTab === "details" ? "block" : "hidden lg:block"
            }`}
          >
            <ServiceDescription description={config.description} />
          </div>
        </div>
      </main>

      {activeTab === "transaction" && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-white/10 bg-[#151517]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          {selectedNominal ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setIsOrderSummaryExpanded((expanded) => !expanded)
                }
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
                  <span className="block truncate text-xs font-bold text-white">
                    {config.summaryTitle}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-400">
                    {selectedNominal.title}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 cursor-pointer text-zinc-300 transition-transform ${isOrderSummaryExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isOrderSummaryExpanded && (
                <OrderSummaryDetails
                  variant="mobile"
                  price={selectedNominal.price}
                  quantity={quantity}
                  fee={0}
                  total={rawTotal}
                />
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
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-xs font-bold text-white shadow-lg transition hover:bg-red-500 active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>Pesan Sekarang!</span>
          </button>
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