# Arsitektur Integrasi Supabase

## 1. Alur data

```text
Browser
  ├─ request halaman/API + cookie sesi
  ▼
Next.js Server / Route Handler
  ├─ validasi sesi dan role
  ├─ validasi payload
  ├─ Prisma Client
  ▼
Supabase Postgres
  ├─ tabel aplikasi
  ├─ RLS + revoked Data API grants
  ├─ audit log
  ├─ distributed rate limit
  └─ trigger realtime.send(...)
           │ metadata invalidasi saja
           ▼
Supabase Realtime Broadcast
           ▼
Browser lain melakukan refetch melalui server/API
```

File mengalir melalui route `/api/upload` setelah autentikasi:

- berita, produk, dokumentasi, profil → bucket public;
- arsip → bucket private, disimpan sebagai URI internal dan ditampilkan melalui signed URL berumur terbatas.

## 2. Mengapa realtime tidak mengirim record lengkap

Data Posyandu dapat memuat NIK, tanggal lahir, alamat, hasil pemeriksaan, dan dokumen. Karena itu trigger hanya menyiarkan:

```json
{
  "table": "monitoring_balita",
  "operation": "INSERT",
  "changedAt": "2026-08-01T16:30:00Z"
}
```

Payload divalidasi menggunakan allowlist tabel/operasi dan refresh dibatasi maksimal sekali per detik. Record aktual tetap diambil melalui endpoint yang terlindungi sesi/role.

## 3. Komponen realtime

- `public.notify_posyandu_realtime()` — fungsi trigger Postgres.
- `trg_<table>_realtime` — statement-level trigger INSERT/UPDATE/DELETE.
- `components/realtime/RealtimeProvider.tsx` — koneksi channel dan refresh server component.
- `hooks/useRealtimeRefresh.ts` — refetch data pada client component.
- `components/realtime/RealtimeStatusBadge.tsx` — status koneksi di navbar.

Tabel yang memicu realtime mencakup pengguna, sasaran, seluruh pemeriksaan, absensi, sesi QR, produk, dokumentasi, arsip, profil, berita, event, FAQ, dan audit log.

## 4. Database connection

- `DATABASE_URL`: Transaction Pooler port 6543 untuk runtime/serverless.
- `DIRECT_URL`: Session Pooler port 5432 atau direct connection untuk migration/seed/Studio.
- `lib/prisma.ts`: singleton Prisma Client untuk mencegah pembuatan client berulang saat development.

## 5. Security boundary

- Tabel `public` mengaktifkan RLS.
- Privilege CRUD role `anon` dan `authenticated` dicabut dari tabel aplikasi.
- Browser tidak memiliki database password atau secret key.
- API route memverifikasi sesi dan role Admin/Kader/Masyarakat.
- Password di-hash bcrypt.
- Login, reset password, dan upload memakai rate limiter tersentralisasi di Postgres.
- Upload divalidasi berdasarkan ekstensi, MIME, ukuran, folder allowlist, dan nama acak UUID.
- Arsip private tidak memiliki reusable public URL.

## 6. Cache policy

Halaman yang membaca data database memakai dynamic rendering/revalidate 0. Fetch operasional memakai `no-store`. API response diberi `Cache-Control: no-store`, sehingga event realtime tidak memunculkan snapshot lama dari cache Next.js.

## 7. Batas istilah “tidak lokal”

Tidak ada data operasional yang disimpan pada database atau filesystem lokal. Browser tetap menggunakan cookie sesi dan aset aplikasi tetap diunduh ke cache browser sebagaimana web normal. Saat development, proses Next.js berjalan di komputer, tetapi database, rate limit, realtime, dan upload tetap menggunakan Supabase cloud.
