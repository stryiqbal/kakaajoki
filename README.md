# KAKAA.JOKI

Landing page website untuk jasa joki game, fokus pada layanan Mobile Legends dan Magic Chess.

## Deskripsi

Website ini menampilkan:
- Hero section yang modern
- Pilihan layanan game
- Halaman kalkulator win rate
- Navbar dan footer yang konsisten
- Banner promo/footer di bagian bawah halaman

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Motion

## Struktur Project

```bash
.
├── public/
│   ├── home/
│   ├── mobilelegends/
│   ├── magicchess/
│   ├── footer.png
│   └── favicon.ico
├── src/
│   ├── app/
│   ├── components/
│   └── globals.css
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── next-env.d.ts
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Buka browser ke:

```bash
http://localhost:3000
```

## Production Build

```bash
npm run build
```

## Deployment

Project ini siap dideploy ke Vercel atau hosting lain yang support Next.js.

## Catatan

- Project ini memakai App Router dari Next.js.
- File metadata utama berada di `src/app/layout.tsx`.
- Favicon dan image branding berada di folder `public`.
