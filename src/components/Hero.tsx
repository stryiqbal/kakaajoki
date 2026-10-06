"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate mt-16 flex min-h-[340px] scroll-mt-16 items-center overflow-hidden bg-[#151517]/50 pb-4 sm:min-h-[420px] sm:mt-[68px] sm:scroll-mt-[68px] sm:pb-6 lg:min-h-[554px] lg:pb-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/home/hero.png"
          alt="Kakaa.Joki, layanan joki Mobile Legends"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#080808]/35"
      />

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { left: "8%", top: "16%", delay: 0, duration: 4.4 },
          { left: "25%", top: "68%", delay: 1.1, duration: 5.2 },
          { left: "52%", top: "12%", delay: 2.2, duration: 4.8 },
          { left: "73%", top: "70%", delay: 0.7, duration: 5.6 },
          { left: "88%", top: "32%", delay: 1.8, duration: 4.6 },
        ].map((meteor) => (
          <motion.span
            key={`${meteor.left}-${meteor.top}`}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 0.65, 0], x: 150, y: 90 }}
            transition={{
              duration: meteor.duration,
              delay: meteor.delay,
              repeat: Infinity,
              repeatDelay: 3.5,
              ease: "linear",
            }}
            style={{ left: meteor.left, top: meteor.top }}
            className="absolute h-px w-24 -rotate-[35deg] bg-gradient-to-r from-transparent via-red-100/70 to-transparent"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative z-20 mx-auto w-full max-w-7xl"
      >
        <h1 className="sr-only">Kakaa.Joki, layanan joki Mobile Legends</h1>
      </motion.div>
    </section>
  );
}