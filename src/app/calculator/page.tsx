"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

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

type CalculatorResult = InvalidResult | AlreadyMetResult | SuccessResult;

function formatPercentage(rate: number) {
  return Number.isInteger(rate) ? rate.toFixed(0) : rate.toString();
}

function calculateResult(
  matches: string,
  winRate: string,
  targetRate: string,
): CalculatorResult {
  const totalMatches = Number(matches) || 0;
  const currentRate = Number(winRate) || 0;
  const desiredRate = Number(targetRate) || 0;

  if (
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
  const [displayResult, setDisplayResult] = useState<CalculatorResult | null>(null);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-x-hidden border-t border-white/5 bg-[radial-gradient(circle_at_top,_rgba(237,16,27,0.1),_transparent_35%)] px-4 pb-24 pt-28 text-white sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <Link href="/" className="inline-block focus:outline-none">
              <Image
                src="/home/logo.png"
                alt="Logo"
                width={112}
                height={112}
                priority
                className="mx-auto h-24 w-auto sm:h-28"
              />
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
              Kalkulator
            </p>
            <h1 className="mt-3 font-[var(--font-chakra)] text-2xl font-bold uppercase sm:text-3xl">
              Win Rate Calculator
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Hitung total jumlah pertandingan yang harus kamu menangkan secara berturut-turut untuk mencapai target win rate yang diinginkan.
            </p>
          </div>

          <div className="mx-auto mt-10 w-full max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDisplayResult(calculateResult(matches, winRate, targetRate));
              }}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-y-1.5">
                  <label htmlFor="total-match" className="block text-xs font-medium text-zinc-300">
                    Total Pertandingan Saat Ini
                  </label>
                  <input
                    id="total-match"
                    name="total-match"
                    type="number"
                    value={matches}
                    onChange={(e) => setMatches(e.target.value)}
                    placeholder="Contoh: 223"
                    className="block h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <label htmlFor="total-winrate" className="block text-xs font-medium text-zinc-300">
                    Win Rate Saat Ini (%)
                  </label>
                  <input
                    id="total-winrate"
                    name="total-winrate"
                    type="number"
                    step="0.1"
                    value={winRate}
                    onChange={(e) => setWinRate(e.target.value)}
                    placeholder="Contoh: 54"
                    className="block h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <label htmlFor="winrate-request" className="block text-xs font-medium text-zinc-300">
                    Target Win Rate (%)
                  </label>
                  <input
                    id="winrate-request"
                    name="winrate-request"
                    type="number"
                    step="0.1"
                    value={targetRate}
                    onChange={(e) => setTargetRate(e.target.value)}
                    placeholder="Contoh: 70"
                    className="block h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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

            {displayResult && (
              <div
                className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-center text-xs font-bold uppercase leading-relaxed text-white shadow-xl sm:px-6 sm:py-5 sm:text-sm"
                role={displayResult.status === "invalid" ? "alert" : "status"}
                aria-live="polite"
              >
                {displayResult.status === "success" ? (
                  <p className="w-max min-w-full whitespace-nowrap">
                    YOU NEED ABOUT{" "}
                    <span className="text-red-400">
                      {displayResult.gamesToWin} WIN WITHOUT LOSE
                    </span>{" "}
                    TO GET A{" "}
                    <span className="text-red-400">
                      {formatPercentage(displayResult.desiredRate)}% WIN RATE.
                    </span>
                  </p>
                ) : displayResult.status === "already_met" ? (
                  <p className="w-max min-w-full whitespace-nowrap">
                    WIN RATE SAAT INI SUDAH MENCAPAI ATAU MELEBIHI TARGET{" "}
                    <span className="text-red-400">
                      {formatPercentage(displayResult.desiredRate)}%.
                    </span>
                  </p>
                ) : (
                  <p className="w-max min-w-full whitespace-nowrap">
                    MASUKKAN ANGKA YANG <span className="text-red-400">VALID</span> UNTUK
                    SEMUA FIELD.
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