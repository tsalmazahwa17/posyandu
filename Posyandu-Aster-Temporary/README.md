# Posyandu Aster — Supabase Realtime Production Edition

Posyandu Aster adalah aplikasi Next.js untuk pengelolaan sasaran, pemeriksaan kesehatan, grafik general dan per individu, absensi, konten publik, arsip, akun, dan audit aktivitas. Versi ini menggunakan layanan cloud Supabase untuk seluruh data operasional.

## Infrastruktur utama

- **Supabase Postgres** — seluruh tabel, relasi, akun aplikasi, pemeriksaan, absensi, konten, audit log, dan rate limit.
- **Prisma ORM** — akses database dari server Next.js.
- **Supabase Realtime Broadcast** — memberi sinyal perubahan lintas tab/perangkat tanpa mengirim data kesehatan ke channel.
- **Supabase Storage** — media publik pada bucket public dan arsip pada bucket private dengan signed URL sementara.
- **Next.js server/API** — autentikasi, otorisasi role, validasi, dan gerbang data sensitif.
- **Vercel-ready** — runtime memakai Transaction Pooler; migrasi memakai Session Pooler/direct connection.

Tidak ada SQLite, PostgreSQL localhost, penyimpanan upload ke `public/uploads`, `localStorage` untuk data aplikasi, maupun data contoh hardcoded sebagai fallback. Pada mode development aplikasi tetap dibuka melalui `localhost`, tetapi database dan file tetap berada di Supabase.

## Instalasi tercepat

1. Baca **`MULAI-DI-SINI.txt`**.
2. Ikuti **`SETUP-SUPABASE-STEP-BY-STEP.md`**.
3. Isi `.env.local` dari `.env.example`.
4. Jalankan:

```bash
npm ci
npm run supabase:bootstrap
npm run dev
```

Untuk memindahkan PostgreSQL lokal lama ke project Supabase kosong:

```bash
# isi OLD_DATABASE_URL pada .env.local terlebih dahulu
npm run supabase:bootstrap:from-local
```

Pada Windows, jalankan `SETUP-WINDOWS.cmd` setelah project Supabase dan `.env.local` siap.

## Setup database dan kolom

Cara utama adalah:

```bash
npm run supabase:bootstrap
```

Perintah tersebut menjalankan seluruh migration pada `prisma/migrations/`. Referensi SQL lengkap tersedia pada:

- `supabase/FULL-DATABASE-REFERENCE.sql`
- `supabase/REALTIME-AND-RATE-LIMIT.sql`
- `docs/DATABASE-DICTIONARY.md`
- `prisma/schema.prisma`

Jangan menjalankan SQL manual dan Prisma migration pada database yang sama secara bersamaan.

## Perintah penting

```bash
npm run doctor              # Validasi environment
npm run db:migrate          # Terapkan migration
npm run db:migrate:local-data # Opsional: pindahkan data PostgreSQL lama
npm run db:seed             # Master data + akun awal, tanpa data kesehatan demo
npm run db:seed:demo        # Opsional, hanya staging/demo
npm run supabase:check      # Cek DB, RLS, trigger Realtime, dan bucket
npm run cloud:audit         # Pastikan tidak ada dependency penyimpanan lokal
npm run routes:check        # Cek konflik route
npm run dev                 # Development server
npm run build               # Production build
npm run health:check        # Cek domain yang sedang berjalan
```

## Model keamanan

Data kesehatan tidak dibaca langsung dari browser menggunakan Data API Supabase. Role `anon` dan `authenticated` dicabut dari tabel aplikasi dan RLS diaktifkan. Browser hanya menggunakan publishable key untuk berlangganan channel Realtime yang berisi metadata invalidasi: nama tabel, jenis operasi, dan waktu perubahan. Setelah menerima sinyal, aplikasi mengambil ulang data melalui server/API yang memeriksa sesi dan role.

`SUPABASE_SECRET_KEY`, connection string database, dan `JWT_SECRET` wajib hanya berada pada server/Vercel Environment Variables—tidak boleh memakai prefix `NEXT_PUBLIC_`.

## Data awal production

`npm run db:seed` hanya membuat:

- kategori sasaran;
- kategori arsip dan berita;
- profil organisasi awal;
- akun Admin dan Kader awal.

Perintah ini tidak memasukkan sasaran, pemeriksaan, absensi, produk, berita, dokumentasi, atau arsip fiktif. Data demo hanya dimasukkan bila sengaja menjalankan `npm run db:seed:demo` pada project staging.

## Dokumen teknis

- `SETUP-SUPABASE-STEP-BY-STEP.md` — panduan instalasi dan deployment.
- `SUPABASE-INTEGRATION.md` — arsitektur dan alur realtime.
- `AUDIT-IMPLEMENTASI.md` — daftar perubahan, pemeriksaan, dan batas verifikasi.
- `VERIFICATION-REPORT.txt` — hasil pemeriksaan paket final.
