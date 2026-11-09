"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ArrowLeft, ArrowRight, LoaderCircle, Mail, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type FormEvent, type KeyboardEvent, type SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";

type RecaptchaApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

function RecaptchaCheckbox({
  isReady,
  hasLoadError,
  onToken,
  onLoadError,
  isBusy,
  refreshRef,
}: {
  isReady: boolean;
  hasLoadError: boolean;
  onToken: Dispatch<SetStateAction<string>>;
  onLoadError: Dispatch<SetStateAction<boolean>>;
  isBusy: boolean;
  refreshRef: { current: (() => void) | null };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (
      !RECAPTCHA_SITE_KEY ||
      !isReady ||
      hasLoadError ||
      widgetIdRef.current !== null ||
      !container ||
      !window.grecaptcha
    ) return;

    try {
      const widgetId = window.grecaptcha.render(container, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => {
          onToken("");
          onLoadError(true);
        },
      });
      widgetIdRef.current = widgetId;
      return () => {
        try {
          window.grecaptcha?.reset(widgetId);
        } finally {
          widgetIdRef.current = null;
          container.replaceChildren();
        }
      };
    } catch {
      widgetIdRef.current = null;
      onLoadError(true);
    }
  }, [hasLoadError, isReady, onLoadError, onToken]);


  const refreshWidget = () => {
    onToken("");
    const widgetId = widgetIdRef.current;
    if (widgetId === null || !window.grecaptcha) {
      onLoadError(true);
      return;
    }

    try {
      window.grecaptcha.reset(widgetId);
    } catch {
      onLoadError(true);
    }
  };
  refreshRef.current = refreshWidget;
  if (!RECAPTCHA_SITE_KEY) {
    return <p role="alert" className="text-xs text-red-300">reCAPTCHA belum dikonfigurasi di server.</p>;
  }
  if (hasLoadError) {
    return <p role="alert" className="text-xs text-red-300">reCAPTCHA gagal dimuat. Muat ulang halaman untuk mencoba lagi.</p>;
  }
  if (!isReady) {
    return <p role="status" className="text-xs text-gray-400">Memuat verifikasi...</p>;
  }

  return <div className="flex w-full justify-center" ref={containerRef} aria-label="Verifikasi I'm not a robot" />;
}

const AdminLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [isCheckComplete, setIsCheckComplete] = useState(false);
  const [isSuccessComplete, setIsSuccessComplete] = useState(false);
  const [direction, setDirection] = useState<number>(1); // 1 untuk maju, -1 untuk mundur
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const [hasRecaptchaLoadError, setHasRecaptchaLoadError] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetCount, setCaptchaResetCount] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const captchaRefreshRef = useRef<(() => void) | null>(null);

  const resetCaptcha = () => {
    setCaptchaToken("");
    setHasRecaptchaLoadError(false);
    setCaptchaResetCount((count) => count + 1);
  };

  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    const focusOtp = () => {
      const firstInput = otpRefs.current[0];
      if (firstInput) {
        firstInput.focus();
      }
    };

    const frameId = window.requestAnimationFrame(focusOtp);
    return () => window.cancelAnimationFrame(frameId);
  }, [step]);

  useEffect(() => {
    if (step !== "otp" || isLoading || !error || otp.some(Boolean)) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      otpRefs.current[0]?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [step, isLoading, error, otp]);

  useEffect(() => {
    if (step !== "otp" || resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [step, resendSeconds]);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleBack = () => {
    if (isLoading || step === "success") return;
    setError("");

    if (step === "otp") {
      setDirection(-1);
      setStep("email");
    } else {
      router.push("/");
    }
  };

  const handleOtpSubmit = async (otpValue: string) => {
    if (!/^\d{6}$/.test(otpValue)) {
      setError("Kode OTP harus terdiri dari 6 digit angka.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", email: email.trim(), token: otpValue }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Kode OTP salah atau sudah kedaluwarsa.");
        setOtp(Array(6).fill(""));
        return;
      }

      setError("");
      setNotice("");
      setDirection(1);
      setStep("success");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailInput = event.currentTarget.querySelector<HTMLInputElement>("#admin-email");
    if (!email.trim()) {
      setError("Please fill out this field.");
      emailInput?.focus({ preventScroll: true });
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Masukkan alamat email yang valid.");
      emailInput?.focus({ preventScroll: true });
      return;
    }
    if (!captchaToken) {
      setError("Mohon selesaikan CAPTCHA terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", email: email.trim(), captchaToken }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Kode OTP belum dapat dikirim. Coba lagi.");
        return;
      }

      setError("");
      setDirection(1);
      setOtp(Array(6).fill(""));
      setResendSeconds(60);
      setStep("otp");
      setNotice("");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      resetCaptcha();
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-otp", email: email.trim() }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Kode OTP belum dapat dikirim. Coba lagi.");
        return;
      }

      setError("");
      setNotice("");
      setOtp(Array(6).fill(""));
      setResendSeconds(60);
      window.requestAnimationFrame(() => otpRefs.current[0]?.focus());
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otpValue = otp.join("");

    if (!otpValue) {
      setError("Please fill out this field.");
      otpRefs.current[0]?.focus({ preventScroll: true });
      return;
    }

    await handleOtpSubmit(otpValue);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isLoading) return;

    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);
    setError("");

    if (nextValue && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    const otpValue = nextOtp.join("");
    if (otpValue.length === otp.length) {
      void handleOtpSubmit(otpValue);
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div data-hide-floating-cs className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      {RECAPTCHA_SITE_KEY && (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => {
            setIsRecaptchaReady(true);
            setHasRecaptchaLoadError(false);
          }}
          onError={() => setHasRecaptchaLoadError(true)}
        />
      )}
      {step !== "success" && (
        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          aria-label="Back"
          className="absolute left-4 top-4 z-20 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:left-6 sm:top-6"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back</span>
        </button>
      )}

      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] p-7 shadow-2xl backdrop-blur-sm sm:p-8">
        {/* Progress Bar */}
        <motion.div
          role="group"
          aria-label={`Langkah ${step === "email" ? 1 : step === "otp" ? 2 : 3} dari 3`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6 flex w-full items-center px-2"
        >
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="h-3 w-3 shrink-0 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          />
          <span aria-hidden="true" className="relative h-px flex-1 bg-white/20">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step === "email" ? 0 : 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
              className="absolute inset-0 origin-left bg-red-500"
            />
          </span>
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.1 }}
            className={`h-3 w-3 shrink-0 rounded-full border-2 ${step === "otp" || step === "success" ? "border-red-500 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "border-white/30 bg-transparent"}`}
          />
          <span aria-hidden="true" className="relative h-px flex-1 bg-white/20">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step === "success" ? 1 : 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
              className="absolute inset-0 origin-left bg-red-500"
            />
          </span>
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.2 }}
            className={`h-3 w-3 shrink-0 rounded-full border-2 ${step === "success" ? "border-red-500 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "border-white/30 bg-transparent"}`}
          />
        </motion.div>
        
        {/* Animated Logo */}
        {step === "email" && (
          <motion.div
            key="logo-email"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 * direction }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-lg"
          >
            <Image
              src="/home/logo.png"
              alt="Kakaa.Joki"
              width={3932}
              height={3959}
              className="h-9 w-9 object-contain"
            />
          </motion.div>
        )}

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email-step"
              noValidate
              onSubmit={handleRequestOtp}
              initial={{ opacity: 0, x: 36 * direction, rotateY: 10 * direction }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -36 * direction, rotateY: -10 * direction }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col gap-1.5">
                <div className={`relative w-full rounded-xl border bg-[#292929] transition focus-within:ring-2 ${error ? "border-red-400/70 focus-within:ring-red-400/30" : "border-transparent focus-within:ring-gray-400"}`}>
                  <div className="relative">
                    <Mail
                      size={18}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="admin-email"
                      aria-label="Email"
                      aria-invalid={Boolean(error)}
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      disabled={isLoading}
                      required
                      className="admin-email-input h-12 w-full rounded-xl bg-transparent pl-12 pr-5 text-sm text-white placeholder-gray-300 focus:outline-none"
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                    />
                  </div>
                </div>
                {error && (
                  <p role="alert" className="px-1 text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>
              <RecaptchaCheckbox
                key={captchaResetCount}
                isReady={isRecaptchaReady}
                hasLoadError={hasRecaptchaLoadError}
                onToken={setCaptchaToken}
                onLoadError={setHasRecaptchaLoadError}
                isBusy={isLoading}
                refreshRef={captchaRefreshRef}
              />
              <div className="flex w-full items-center gap-3">
                <button
                  type="button"
                  onClick={() => captchaRefreshRef.current?.()}
                  disabled={!isRecaptchaReady || isLoading || hasRecaptchaLoadError}
                  className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white shadow transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={17} aria-hidden="true" />
                </button>
                <motion.button
                  type="submit"
                  aria-label={isLoading ? "Mengirim kode OTP" : "Kirim kode OTP"}
                  disabled={isLoading}
                  className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white shadow transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight size={17} aria-hidden="true" />
                  )}
                </motion.button>
              </div>
            </motion.form>
          ) : step === "otp" ? (
            <motion.form
              key="otp-step"
              noValidate
              onSubmit={handleVerifyOtp}
              initial={{ opacity: 0, x: 36 * direction, rotateY: 10 * direction }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: 36 * direction, rotateY: 10 * direction }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      id={index === 0 ? "admin-otp" : undefined}
                      autoFocus={index === 0}
                      aria-label={`Digit OTP ${index + 1}`}
                      aria-invalid={Boolean(error)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={otp[index]}
                      disabled={isLoading}
                      
                      className={`h-12 w-11 rounded-xl border bg-white/10 text-center text-lg font-medium text-white outline-none transition focus:ring-2 ${
                        error ? "border-red-400/70 focus:ring-red-400/30" : "border-transparent focus:ring-gray-400"
                      }`}
                      onChange={(event) => {
                        handleOtpChange(index, event.target.value);
                        setError("");
                      }}
                      onKeyDown={(event) => {
                        handleOtpKeyDown(index, event);
                      }}
                    />
                  ))}
                </div>
                {error && (
                  <p role="alert" className="px-1 text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>
              <AnimatePresence>
                {notice && (
                  <motion.div
                    role="status"
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
                    className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-2xl"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                      <X size={15} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <p className="min-w-0 font-medium">{notice}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-center text-xs">
                <div className="inline-flex items-center gap-1">
                  <span className="text-gray-400">Didn&apos;t get the code?</span>
                  <button
                    type="button"
                    disabled={resendSeconds > 0 || isLoading}
                    onClick={() => void handleResendOtp()}
                    className={`p-0 text-xs transition ${resendSeconds > 0 || isLoading ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-gray-400 underline underline-offset-4 hover:text-white"}`}
                  >
                    Click to resend
                  </button>
                  {resendSeconds > 0 && (
                    <span className="text-gray-500">({resendSeconds}s)</span>
                  )}
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, x: 36 * direction, rotateY: 10 * direction }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -36, rotateY: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex w-full flex-col items-center gap-4 text-center"
            >
              <div className="relative flex h-14 w-14 items-center justify-center">
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 56 56"
                  className="absolute inset-0 h-full w-full -rotate-90"
                >
                  {isSuccessComplete && (
                    <motion.circle
                      cx="28"
                      cy="28"
                      r="25"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 3, ease: "linear" }}
                      onAnimationComplete={() => router.replace("/admin")}
                    />
                  )}
                </motion.svg>
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-white"
                >
                  <motion.path
                    d="M5 12 L9 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2, ease: "easeInOut", delay: 0.15 }}
                  />
                  <motion.path
                    d="M9 16 L19 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.35 }}
                    onAnimationComplete={() => setIsCheckComplete(true)}
                  />
                </motion.svg>
              </div>
              {isCheckComplete && (
                <motion.h2
                  initial={{ opacity: 0, y: 20, scale: 0.75 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  onAnimationComplete={() => setIsSuccessComplete(true)}
                  className="text-xl font-semibold text-white"
                >
                  Success
                </motion.h2>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminLoginPage;
