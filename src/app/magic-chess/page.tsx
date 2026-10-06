"use client";

import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { motion } from "motion/react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const services = [
  {
    title: "Joki Magic Chess: Go Go",
    image: "/magicchess/Joki%20MCGG.png?v=20261001",
    href: "/magic-chess/go-go",
  },
  {
    title: "Joki Magic Chess: Go Go MMR",
    image: "/magicchess/Joki%20MCGG%20MMR.png?v=20261001",
    href: "/magic-chess/mmr",
  },
];

export default function MagicChessPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen border-t border-white/5 bg-[radial-gradient(circle_at_top,_rgba(237,16,27,0.1),_transparent_35%)] px-4 pb-24 pt-28 text-white sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <header className="mt-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
                Magic Chess: Go Go
              </p>

              <h1 className="mt-3 font-[var(--font-chakra)] text-2xl font-bold uppercase sm:text-3xl">
                Pilih Layanan
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                Pilih layanan yang sesuai dengan kebutuhanmu.
              </p>
            </header>
          </motion.div>

          <div className="mx-auto mt-10 flex w-full justify-center">
            <div className="grid w-full min-w-0 max-w-[520px] grid-cols-2 gap-3 sm:gap-7 lg:max-w-[700px]">
              {services.map((service, index) => (
                <motion.button
                  key={service.title}
                  type="button"
                  aria-label={service.title}
                  onClick={() => router.push(service.href)}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative aspect-[4/6] w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 text-left shadow-xl transition-[border-color,box-shadow] duration-300 hover:border-red-500/80 hover:shadow-2xl focus-visible:border-red-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 45vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                />

                <span className="absolute inset-x-0 bottom-0 hidden min-h-24 translate-y-full flex-col items-start justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-4 pt-10 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:flex sm:px-5 sm:pb-5">
                  <span className="font-[var(--font-chakra)] text-sm leading-tight text-white sm:text-base">
                    {service.title}
                  </span>

                  <span className="mt-1 text-[10px] font-semibold uppercase text-red-400 sm:text-xs">
                    MAGIC CHESS
                  </span>
                </span>
              </motion.button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}