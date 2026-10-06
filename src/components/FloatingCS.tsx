"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function FloatingCS() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      const container = containerRef.current;
      if (container && !event.composedPath().includes(container)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="fixed bottom-0 right-3 z-40">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Customer Service"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="floating-cs-menu"
        className="cursor-pointer inline-flex h-10 w-10 items-center justify-center gap-2 rounded-t-lg rounded-b-none bg-red-600 px-0 text-[11px] font-bold uppercase text-white shadow-lg transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:w-auto sm:px-4"
      >
        <Headphones size={16} />
        <span className="hidden sm:inline">Customer Service</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="floating-cs-menu"
            role="menu"
            aria-label="Customer Service"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="absolute bottom-full right-0 mb-3 w-56 origin-bottom-right overflow-hidden rounded-lg border border-white/10 bg-[#151517] text-white shadow-2xl shadow-black/40"
          >
          <div className="border-b border-white/10 px-3.5 py-3 text-xs font-bold text-white">
            Customer Service
          </div>
          <div className="p-1.5">
              <a
                role="menuitem"
                onClick={() => setIsOpen(false)}
                href="https://wa.me/6288706392829"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-center rounded-md px-2.5 text-xs text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400"
              >
                WhatsApp
              </a>
              <a
                role="menuitem"
                onClick={() => setIsOpen(false)}
                href="https://www.instagram.com/kakaa.joki"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-center rounded-md px-2.5 text-xs text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400"
              >
                Instagram
              </a>
              <a
                role="menuitem"
                onClick={() => setIsOpen(false)}
                href="https://www.tiktok.com/@kakaa.joki"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-center rounded-md px-2.5 text-xs text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400"
              >
                TikTok
              </a>
          </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}