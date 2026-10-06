import Image from "next/image";
import { CheckCircle2, Clock3, HandCoins, Zap } from "lucide-react";

type ServiceHeroProps = {
  bannerSrc?: string;
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
};

export default function ServiceHero({
  bannerSrc = "/Banner.png",
  imageSrc,
  imageAlt,
  eyebrow, 
  title,
}: ServiceHeroProps) {
  return (
    <div className="relative w-full pt-[68px]">
      <div className="relative w-full overflow-hidden">
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
              <span className="inline-flex items-center gap-1.5"><HandCoins size={14} className="text-red-400" /> Mahal? Nego</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-red-400" /> Open 24/7 (Off Tidur)</span>
              <span className="inline-flex items-center gap-1.5"><Zap size={14} className="text-red-400" /> Fast Process</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-red-400" /> No Ribet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}