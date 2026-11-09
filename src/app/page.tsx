"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { motion } from "motion/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const services = [
  {
    title: "Joki Video Montage Mobile Legends",
    image: "/mobilelegends/Joki%20Video%20Montage.jpg",
    href: "/mobile-legends/video-montage",
    tag: "MOBILE LEGENDS",
  },
  {
    title: "Joki Rising League Mobile Legends",
    image: "/mobilelegends/Joki%20Rising%20League.jpg",
    href: "/mobile-legends/rising-league",
    tag: "MOBILE LEGENDS",
  },
  {
    title: "Joki Rank Mobile Legends",
    image: "/mobilelegends/Joki%20Rank.jpg",
    href: "/mobile-legends/rank",
    tag: "MOBILE LEGENDS",
  },
  {
    title: "Joki Mabar / Joki Gendong",
    image: "/mobilelegends/Joki%20Mabar.jpg",
    href: "/mobile-legends/mabar",
    tag: "MOBILE LEGENDS",
  },
  {
    title: "Joki MMR Rank Mobile Legends",
    image: "/mobilelegends/Joki%20Mmr.jpg",
    href: "/mobile-legends/mmr",
    tag: "MOBILE LEGENDS",
  },
  {
    title: "Joki Classic",
    image: "/mobilelegends/Joki%20Classic.jpg",
    href: "/mobile-legends/classic",
    tag: "MOBILE LEGENDS",
  },
  {
    title: "Joki Magic Chess: Go Go",
    image: "/magicchess/Joki%20Mcgg.jpg",
    href: "/magic-chess/go-go",
    tag: "MAGIC CHESS",
  },
  {
    title: "Joki Magic Chess: Go Go MMR",
    image: "/magicchess/Joki%20Mcgg%20Mmr.jpg",
    href: "/magic-chess/mmr",
    tag: "MAGIC CHESS",
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<
    "ALL" | "MOBILE LEGENDS" | "MAGIC CHESS"
  >("ALL");
  const visibleServices =
    selectedGame === "ALL"
      ? services
      : services.filter((service) => service.tag === selectedGame);
  const gameTabs = [
    { value: "ALL", label: "All Games" },
    { value: "MOBILE LEGENDS", label: "Mobile Legends" },
    { value: "MAGIC CHESS", label: "Magic Chess" },
  ] as const;

  return (
    <>
      <Navbar />

      <main>
        <section
          id="home"
          className="page-background relative mt-16 scroll-mt-16 overflow-hidden px-4 pb-6 pt-6 sm:mt-[68px] sm:scroll-mt-[68px] sm:px-8 sm:pb-8 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-10"
        >
          <div className="relative isolate flex aspect-[3120/1225] min-h-0 items-center overflow-hidden rounded-xl bg-[#151517]/50">
            <div className="absolute inset-0">
              <Image
                src="/home/hero.png"
                alt="Kakaa.Joki, layanan joki Mobile Legends"
                fill
                preload
                quality={75}
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 4rem), calc(100vw - 5rem)"
                className="pointer-events-none object-cover object-center"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/55 via-transparent to-black/10"
            />

            <div
              className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden md:block"
              aria-hidden="true"
            >
              {Array.from({ length: 8 }, (_, meteorIndex) => ({
                left: `${(meteorIndex * 37 + 7) % 100}%`,
                top: `${(meteorIndex * 53 + 5) % 100}%`,
                delay: (meteorIndex * 0.37) % 5.5,
                duration: 2.8 + (meteorIndex % 5) * 0.45,
                travelX: 80 + (meteorIndex % 4) * 25,
                travelY: 140 + (meteorIndex % 3) * 35,
                repeatDelay: 0.5 + (meteorIndex % 4) * 0.35,
              })).map((meteor, meteorIndex) => (
                <motion.span
                  key={meteorIndex}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    x: meteor.travelX,
                    y: meteor.travelY,
                  }}
                  transition={{
                    duration: meteor.duration,
                    delay: meteor.delay,
                    repeat: Infinity,
                    repeatDelay: meteor.repeatDelay,
                    ease: "linear",
                  }}
                  style={{ left: meteor.left, top: meteor.top }}
                  className="absolute h-px w-16 -rotate-[35deg] bg-gradient-to-r from-transparent via-red-100/80 to-transparent sm:w-24"
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-4 pb-7 text-center sm:pb-10">
              <p className="inline-flex items-center gap-3 font-[var(--font-chakra)] text-2xl font-bold uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,1)] sm:text-4xl">
                LIVE SETIAP HARI
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-100 drop-shadow-[0_2px_12px_rgba(0,0,0,1)] sm:text-sm">
                Saksikan live setiap hari di akun tiktok resmi @kakaajoki
              </p>
            </div>

            <h1 className="sr-only">
              Kakaa.Joki, layanan joki Mobile Legends dan Magic Chess
            </h1>
          </div>
        </section>

        <section
          id="layanan"
          className="page-background relative border-t border-white/5 px-4 pt-4 pb-12 sm:px-6 sm:pt-10 sm:pb-16"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mt-8 w-full max-w-7xl"
            >
              <div
                role="tablist"
                aria-label="Pilih game"
                className="flex flex-wrap justify-center gap-1.5"
              >
                {gameTabs.map((game) => (
                  <button
                    key={game.value}
                    id={`game-${game.value.toLowerCase().replaceAll(" ", "-")}-tab`}
                    type="button"
                    role="tab"
                    aria-selected={selectedGame === game.value}
                    aria-controls="service-list"
                    onClick={() => setSelectedGame(game.value)}
                    className={`min-h-9 cursor-pointer rounded-md border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      selectedGame === game.value
                        ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/30"
                        : "border-white/10 bg-[#28282b] text-zinc-300 hover:bg-[#343438] hover:text-white"
                    }`}
                  >
                    {game.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="mx-auto mt-10 flex w-full justify-center">
              <motion.div
                key={selectedGame}
                id="service-list"
                role="tabpanel"
                aria-labelledby={`game-${selectedGame.toLowerCase().replaceAll(" ", "-")}-tab`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                  },
                }}
                className="grid w-full min-w-0 max-w-7xl grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5 lg:gap-5 xl:grid-cols-6"
              >
                {visibleServices.map((service) => (
                  <motion.button
                    key={service.title}
                    type="button"
                    aria-label={service.title}
                    onClick={() => router.push(service.href)}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.45, ease: "easeOut" },
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 text-left shadow-xl transition-[border-color,box-shadow] duration-300 hover:border-red-500/80 hover:shadow-2xl focus-visible:border-red-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      quality={70}
                      sizes="(max-width: 639px) 31vw, (max-width: 1023px) 31vw, (max-width: 1279px) 25vw, 16.7vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    />
                    <span className="absolute inset-x-0 bottom-0 hidden min-h-24 translate-y-full flex-col items-start justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-4 pt-10 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:flex sm:px-5 sm:pb-5">
                      <span className="font-[var(--font-chakra)] text-sm leading-tight text-white sm:text-base">
                        {service.title}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold uppercase text-red-400 sm:text-xs">
                        {service.tag}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
