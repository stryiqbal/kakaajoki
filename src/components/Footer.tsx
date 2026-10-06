import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/#layanan" },
  { label: "Kalkulator Win Rate", href: "/calculator" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/kakaa.joki/" },
  { label: "TikTok", href: "https://www.tiktok.com/@kakaa.joki" },
  { label: "WhatsApp", href: "https://wa.me/6288706392829" },
];
 
export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#151517]">
      <div className="mx-auto max-w-7xl px-6 pb-7 pt-12 lg:px-8 lg:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr] lg:gap-16">
          <div>
            <Link href="/" aria-label="Kakaa.Joki beranda" className="inline-flex items-center gap-3">
              <Image
                src="/home/logo.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <span className="text-lg font-semibold text-white">
                Kakaa<span className="text-red-400">.</span>Joki
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-300">
              Jasa joki Mobile Legends cepat, aman, dan profesional.
            </p>
          </div>

          <nav aria-label="Navigasi footer">
            <h2 className="text-xs font-semibold uppercase text-red-400">
              Jelajahi
            </h2>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 transition-colors hover:text-red-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase text-red-400">
              Social Media
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 transition-colors hover:text-red-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kakaa.Joki.  All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}