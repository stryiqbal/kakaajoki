"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, Scale, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const navLinks = [
  {
    label: "Home",
    href: "/", 
    icon: ShoppingBag,
  },
  { 
    label: "Kalkulator",
    href: "/calculator",
    icon: Scale,
  },
];

const menuVariants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
  closed: { transition: { staggerChildren: 0.035, staggerDirection: -1 } },
};

const menuItemVariants = {
  open: { opacity: 1, x: 0, transition: { duration: 0.18 } },
  closed: { opacity: 0, x: -10, transition: { duration: 0.12 } },
};

const drawerVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { type: "tween", duration: 0.24, ease: "easeInOut", when: "beforeChildren" },
  },
  closed: {
    x: "-100%",
    opacity: 0.8,
    transition: { type: "tween", duration: 0.24, ease: "easeInOut", when: "afterChildren" },
  },
} as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const pathname = usePathname();
  const underlineHref = hoveredHref ?? pathname;

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [isOpen]);

  function handleHomeLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setIsOpen(false);
    window.location.assign("/");
  }

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#151517]/75 text-white shadow-lg shadow-black/20 backdrop-blur-xl">
      <nav className="flex h-[64px] items-center justify-between px-3.5 sm:h-[68px] sm:px-6" aria-label="Navigasi utama">
        <Link href="/" onClick={handleHomeLogoClick} aria-label="Kakaa.Joki beranda" className="shrink-0">
          <Image
            src="/home/logo.png"
            alt="Kakaa.Joki"
            width={48}
            height={48}
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
        </Link>

        <div
          className="hidden h-full items-stretch gap-1 min-[768px]:flex"
          onMouseLeave={() => setHoveredHref(null)}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            const showUnderline = underlineHref === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={link.href === "/" ? handleHomeLogoClick : undefined}
                onMouseEnter={() => setHoveredHref(link.href)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-2 px-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-red-400"
                    : "text-zinc-300"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{link.label}</span>
                {showUnderline && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute inset-x-2 bottom-0 h-[2px] bg-red-500"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition-colors hover:bg-white/5 sm:h-10 sm:w-10 min-[768px]:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

    </header>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="navbar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm min-[768px]:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      {isOpen && (
        <motion.aside
          key="navbar-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          variants={drawerVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed inset-y-0 left-0 z-[61] flex w-[min(68vw,280px)] flex-col border-r border-white/10 bg-[#151517] text-white shadow-2xl shadow-black/40 min-[768px]:hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:h-[88px] sm:px-5">
            <Link
              href="/"
              aria-label="Kakaa.Joki beranda"
              onClick={handleHomeLogoClick}
              className="shrink-0"
            >
              <Image
                src="/home/logo.png"
                alt="Kakaa.Joki"
                width={44}
                height={44}
                className="h-11 w-11 object-contain sm:h-[52px] sm:w-[52px]"
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
            >
              <X size={22} />
            </button>
          </div>

          <motion.nav
            aria-label="Navigasi mobile"
            variants={menuVariants}
            className="flex flex-col gap-1 px-3 py-4 sm:px-4 sm:py-6"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <motion.div key={link.label} variants={menuItemVariants}>
                  <Link
                    href={link.href}
                    onClick={(event) => {
                      if (link.href === "/") {
                        handleHomeLogoClick(event);
                      } else {
                        setIsOpen(false);
                      }
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-red-500/10 hover:text-red-400 sm:min-h-14 sm:px-4 ${
                      isActive ? "text-red-400" : "text-zinc-300"
                    }`}
                  >
                    <span>{link.label}</span>
                    <Icon size={18} strokeWidth={1.8} className="text-zinc-300" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </motion.aside>
      )}
    </AnimatePresence>
    </>
  );
}