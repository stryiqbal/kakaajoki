"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

type InvalidResult = {
  status: "invalid";
  message: string;
};

type AlreadyMetResult = {
  status: "already_met";
  message: string;
  currentWins: number;
  totalMatches: number;
  currentRate: number;
  desiredRate: number;
};

type UnreachableResult = {
  status: "unreachable";
  message: string;
};

type SuccessResult = {
  status: "success";
  message: string;
  currentWins: number;
  totalMatches: number;
  currentRate: number;
  desiredRate: number;
  gamesToWin: number;
  totalGamesAfter: number;
  finalWins: number;
  finalRate: number;
};

type CalculatorResult =
  | InvalidResult
  | AlreadyMetResult
  | UnreachableResult
  | SuccessResult;

function formatPercentage(rate: number) {
  return Number.isInteger(rate) ? rate.toFixed(0) : rate.toString();
}

function getCalculatorValidationMessage(input: HTMLInputElement) {
  if (input.validity.valueMissing) {
    if (input.id === "total-match") {
      return "Silahkan isi total pertandingan terlebih dahulu.";
    }
    if (input.id === "total-winrate") {
      return "Silahkan isi win rate saat ini terlebih dahulu.";
    }
    return "Silahkan isi target win rate terlebih dahulu.";
  }

  if (input.validity.badInput) {
    return "Masukkan angka yang valid.";
  }
  if (input.validity.rangeUnderflow) {
    return input.id === "total-match"
      ? "Total pertandingan minimal adalah 1."
      : "Win rate minimal adalah 0%.";
  }
  if (input.validity.rangeOverflow) {
    return "Win rate maksimal adalah 100%.";
  }
  if (input.validity.stepMismatch) {
    return input.id === "total-match"
      ? "Total pertandingan harus berupa bilangan bulat."
      : "Win rate harus menggunakan kelipatan 0,1%.";
  }

  return "Masukkan angka yang valid.";
}

function calculateResult(
  matches: string,
  winRate: string,
  targetRate: string,
): CalculatorResult {
  if (!matches.trim() || !winRate.trim() || !targetRate.trim()) {
    return {
      status: "invalid",
      message: "Silahkan isi semua field terlebih dahulu.",
    };
  }

  const totalMatches = Number(matches);
  const currentRate = Number(winRate);
  const desiredRate = Number(targetRate);

  if (
    !Number.isFinite(totalMatches) ||
    !Number.isFinite(currentRate) ||
    !Number.isFinite(desiredRate) ||
    totalMatches <= 0 ||
    currentRate < 0 ||
    desiredRate < 0 ||
    currentRate > 100 ||
    desiredRate > 100
  ) {
    return {
      status: "invalid",
      message: "Masukkan angka yang valid untuk semua field.",
    };
  }

  const currentWins = (totalMatches * currentRate) / 100;

  if (desiredRate === 100 && currentRate < 100) {
    return {
      status: "unreachable",
      message: "Target win rate 100% tidak dapat dicapai jika sudah ada pertandingan yang kalah.",
    };
  }

  if (desiredRate <= currentRate) {
    return {
      status: "already_met",
      message: `Win rate saat ini sudah mencapai atau melebihi target ${desiredRate}%.`,
      currentWins,
      totalMatches,
      currentRate,
      desiredRate,
    };
  }

  const neededGames =
    (totalMatches * desiredRate - 100 * currentWins) / (100 - desiredRate);

  if (!Number.isFinite(neededGames) || neededGames <= 0) {
    return {
      status: "already_met",
      message: "Target sudah tercapai dengan kondisi saat ini.",
      currentWins,
      totalMatches,
      currentRate,
      desiredRate,
    };
  }

  const gamesToWin = Math.ceil(neededGames);
  const totalGamesAfter = totalMatches + gamesToWin;
  const finalWins = currentWins + gamesToWin;
  const finalRate = (finalWins / totalGamesAfter) * 100;
  const formattedTargetRate = Number.isInteger(desiredRate)
    ? desiredRate.toFixed(0)
    : desiredRate.toString();

  return {
    status: "success",
    message: `YOU NEED ABOUT ${gamesToWin} WIN WITHOUT LOSE TO GET A ${formattedTargetRate}% WIN RATE.`,
    currentWins,
    totalMatches,
    currentRate,
    desiredRate,
    gamesToWin,
    totalGamesAfter,
    finalWins,
    finalRate,
  };
}

export default function CalculatorPage() {
  const [matches, setMatches] = useState<string>("");
  const [winRate, setWinRate] = useState<string>("");
  const [targetRate, setTargetRate] = useState<string>("");
  const [displayResult, setDisplayResult] = useState<CalculatorResult | null>(
    null,
  );
  const [alertMessage, setAlertMessage] = useState("");
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    },
    [],
  );

  function showValidationAlert(message: string) {
    setAlertMessage(message);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage("");
      alertTimeoutRef.current = null;
    }, 5000);
  }

  function clearValidationAlert() {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = null;
    setAlertMessage("");
  }

  return (
    <>
      <Navbar />

      <main className="page-background relative min-h-screen overflow-x-hidden border-t border-white/5 px-4 pb-24 pt-28 text-white sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <Link href="/" className="inline-block focus:outline-none">
              <Image
                src="/home/logo.png?v=3"
                alt="Logo"
                width={3932}
                height={3959}
                unoptimized
                priority
                className="mx-auto h-20 w-auto sm:h-24"
              />
            </Link>
            <h1 className="mt-3 font-[var(--font-chakra)] text-xl font-bold uppercase sm:text-3xl">
              Kalkulator Win Rate
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Hitung total jumlah pertandingan yang harus kamu menangkan secara
              berturut-turut untuk mencapai target win rate yang diinginkan.
            </p>
          </div>

          <div className="mx-auto mt-10 w-full max-w-xl">
            <form
              onInvalidCapture={(event) => {
                event.preventDefault();
                const firstInvalid =
                  event.currentTarget.querySelector<HTMLInputElement>(":invalid");
                if (!firstInvalid) return;

                showValidationAlert(getCalculatorValidationMessage(firstInvalid));
                window.requestAnimationFrame(() => {
                  firstInvalid.focus({ preventScroll: true });
                  firstInvalid.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                });
              }}
              onSubmit={(e) => {
                e.preventDefault();
                clearValidationAlert();
                const result = calculateResult(matches, winRate, targetRate);
                setDisplayResult(result);
                if (
                  result.status === "invalid" ||
                  result.status === "unreachable"
                ) {
                  showValidationAlert(result.message);
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-y-1.5">
                  <label
                    htmlFor="total-match"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Total Pertandingan Saat Ini
                  </label>
                  <input
                    id="total-match"
                    name="total-match"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={matches}
                    onChange={(e) => {
                      setMatches(e.target.value);
                    }}
                    placeholder="Contoh: 223"
                    className="block h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-base text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <label
                    htmlFor="total-winrate"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Win Rate Saat Ini (%)
                  </label>
                  <input
                    id="total-winrate"
                    name="total-winrate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={winRate}
                    onChange={(e) => {
                      setWinRate(e.target.value);
                    }}
                    placeholder="Contoh: 54"
                    className="block h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-base text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <label
                    htmlFor="winrate-request"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Target Win Rate (%)
                  </label>
                  <input
                    id="winrate-request"
                    name="winrate-request"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={targetRate}
                    onChange={(e) => {
                      setTargetRate(e.target.value);
                    }}
                    placeholder="Contoh: 70"
                    className="block h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-base text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Hitung Win Rate
              </button>
            </form>

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
                  <p className="min-w-0 font-medium">{alertMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {displayResult &&
              displayResult.status !== "invalid" &&
              displayResult.status !== "unreachable" && (
              <div
                className="mt-5 w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-4 text-center text-xs font-bold uppercase leading-relaxed text-white shadow-xl sm:px-6 sm:py-5 sm:text-sm"
                role="status"
                aria-live="polite"
              >
                {displayResult.status === "success" ? (
                  <p className="w-full min-w-0 whitespace-normal break-words">
                    YOU NEED ABOUT{" "}
                    <span className="text-red-400">
                      {displayResult.gamesToWin} WIN WITHOUT LOSE
                    </span>{" "}
                    TO GET A{" "}
                    <span className="text-red-400">
                      {formatPercentage(displayResult.desiredRate)}% WIN RATE.
                    </span>
                  </p>
                ) : (
                  <p className="w-full min-w-0 whitespace-normal break-words">
                    WIN RATE SAAT INI SUDAH MENCAPAI ATAU MELEBIHI TARGET{" "}
                    <span className="text-red-400">
                      {formatPercentage(displayResult.desiredRate)}%.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
