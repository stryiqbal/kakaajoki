# KAKAA.JOKI

Platform pemesanan jasa joki game untuk Mobile Legends dan Magic Chess, dilengkapi kalkulator win rate, pengecekan order, dan dashboard admin.

## Deskripsi

Website ini menyediakan katalog layanan, pemesanan dengan QRIS, pelacakan status order, kalkulator win rate, chatbot FAQ, dan dashboard admin.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Motion

## Struktur Project

- `public/`: gambar dan media, dikelompokkan berdasarkan halaman atau layanan.
- `src/app/`: halaman dan endpoint API Next.js.
  - `admin/`, `api/`: dashboard/login admin dan endpoint order, autentikasi, serta chatbot.
  - `mobile-legends/[service]/`, `magic-chess/[service]/`: route dinamis untuk halaman layanan.
  - `calculator/`, `cek-transaksi/`, `page.tsx`: kalkulator, pelacakan order, dan beranda.
- `src/components/layout/`: komponen yang dipakai lintas halaman.
- `src/features/services/`: katalog layanan, formulir order, checkout, dan label field akun bersama.
- `src/lib/`: utilitas dan akses data yang dikelompokkan berdasarkan domain (`admin/`, `orders/`, `supabase/`), serta pembacaan request.
- `src/proxy.ts`: pemeriksaan akses halaman admin.
- `supabase/migrations/`: perubahan skema database dan rate limit.

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

## Pemesanan QRIS

Tombol **Pesan Sekarang** membuka QRIS statis di `public/lainnya/Qr.jpeg`. Pelanggan mengunggah bukti transfer gambar; order dan bukti disimpan privat dengan status **Menunggu Verifikasi Admin**. Setelah payment ditandai **Paid**, admin dapat mengatur progres akun menjadi **Pending**, **Proses**, atau **Selesai**. Password akun dienkripsi AES-256-GCM sebelum disimpan dan hanya didekripsi pada endpoint admin terautentikasi. OTP dan field rahasia lainnya tidak disimpan.

Dashboard admin **Revenue** menghitung order setelah pembayaran dikonfirmasi **Paid**, berdasarkan `paid_at` dalam zona waktu Asia/Jakarta. Kartu All-time Revenue menjumlahkan semua pembayaran Paid. Order lama yang sudah Paid saat migration diterapkan memakai `updated_at` sebagai perkiraan tanggal pembayaran; konfirmasi baru memakai waktu aktual.

Untuk mengaktifkan penyimpanan order:

1. Jalankan `supabase/migrations/202611060001_create_orders.sql` pada SQL Editor project Supabase. Migration membuat tabel `orders` dan bucket storage privat `order-proofs`.
2. Jalankan `supabase/migrations/202611060002_order_account_status.sql` untuk menambahkan status progres akun. Order lama yang sudah paid akan mulai dari `pending`.
3. Jalankan migration lain di `supabase/migrations/` secara berurutan, termasuk `202611090001_order_account_data_retention.sql`, `202611090002_order_paid_at.sql`, dan `202611090003_order_lifetime_revenue.sql`.
4. Isi `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`/environment server. Jangan beri prefix `NEXT_PUBLIC_` dan jangan kirim nilainya ke browser.
5. Isi `ORDER_ACCOUNT_ENCRYPTION_KEY` dengan secret acak minimal 32 karakter di environment server. Simpan backup key dengan aman; password yang sudah tersimpan tidak dapat didekripsi jika key hilang atau berubah.
6. Pastikan `public/lainnya/Qr.jpeg` adalah QRIS merchant yang aktif dan benar.

Gunakan Order ID dan nomor WhatsApp yang sama dengan saat pemesanan pada halaman **Cek transaksi** untuk melihat status order. Bukti transfer hanya tersedia bagi admin.

## Deployment

Project ini siap dideploy ke Vercel atau hosting lain yang support Next.js.
Pastikan reverse proxy menghapus `X-Forwarded-For` dari request klien lalu mengisinya dengan IP klien yang tepercaya; limiter order dan chatbot memakai header tersebut.
Data akun order dihapus otomatis oleh Supabase Cron setiap hari pukul 03.00 UTC. Data dihapus 7 hari setelah status akun menjadi **Selesai**, atau paling lambat 30 hari setelah order dibuat jika belum selesai. Order dan bukti transfer tetap disimpan.

## Admin Email OTP

Login admin menggunakan Supabase Auth email OTP. Siapkan environment lokal dan konfigurasi layanan sebagai berikut:

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `ADMIN_EMAILS` dengan satu atau beberapa email admin, dipisahkan koma.
3. Isi `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` dengan site key Google reCAPTCHA v2 Checkbox dan `RECAPTCHA_SECRET_KEY` dengan secret key dari pasangan key yang sama. Jangan beri prefix `NEXT_PUBLIC_` pada secret key.
4. Pastikan email admin sudah terdaftar di Supabase Auth dan daftarkan domain produksi serta `localhost` pada konfigurasi Google reCAPTCHA.
5. Atur template **Magic Link** Supabase agar menampilkan kode OTP menggunakan `{{ .Token }}`.
6. Setelah mengubah `.env.local`, mulai ulang server Next.js.

Endpoint login hanya mengizinkan email yang tercantum di `ADMIN_EMAILS` dan tidak membuat akun baru. Pastikan migration di `supabase/migrations/` sudah dijalankan sesuai urutan pada bagian **Pemesanan QRIS**.

## Catatan

- Project ini memakai App Router dari Next.js.
- File metadata utama berada di `src/app/layout.tsx`.
- Favicon dan image branding berada di folder `public`.
