# Setup Supabase Posyandu Aster — Step by Step

Panduan ini dibuat untuk pemasangan dari project Supabase kosong sampai website production. Jalur yang direkomendasikan menggunakan Prisma migration otomatis; Anda tidak perlu membuat tabel satu per satu melalui Table Editor.

---

## Hasil akhir

Setelah seluruh langkah selesai:

- seluruh data aplikasi berada di Supabase Postgres;
- perubahan data muncul lintas perangkat tanpa refresh manual;
- file media berada di bucket public Supabase Storage;
- arsip berada di bucket private dan dibuka memakai signed URL sementara;
- tidak ada PostgreSQL/SQLite lokal atau upload filesystem lokal;
- database production tidak berisi data kesehatan contoh;
- aplikasi siap dideploy ke Vercel.

---

## 1. Persyaratan

Siapkan:

- Node.js 20 atau lebih baru;
- npm;
- akun Supabase;
- akun GitHub dan Vercel untuk deployment production;
- ZIP project ini.

Cek Node dan npm:

```bash
node -v
npm -v
```

---

## 2. Buat project Supabase

1. Masuk ke dashboard Supabase.
2. Klik **New project**.
3. Pilih organization.
4. Isi nama project, misalnya `posyandu-aster-production`.
5. Buat database password yang kuat dan simpan di password manager.
6. Pilih region yang dekat dengan mayoritas pengguna.
7. Tunggu sampai project berstatus aktif.

Untuk pengembangan serius, sebaiknya buat dua project terpisah:

- `posyandu-aster-staging` untuk uji coba;
- `posyandu-aster-production` untuk data asli.

Jangan memakai data kesehatan asli pada staging.

---

## 3. Ambil connection string database

Klik tombol **Connect** pada dashboard project.

### 3.1 `DATABASE_URL` — runtime

1. Pilih **Transaction pooler**.
2. Salin connection string port `6543`.
3. Pastikan bagian akhir memiliki:

```text
?pgbouncer=true&connection_limit=1&sslmode=require
```

Contoh bentuk:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
```

### 3.2 `DIRECT_URL` — migration dan seed

1. Pilih **Session pooler** port `5432`.
2. Salin connection string.
3. Tambahkan `?sslmode=require` bila belum ada.

```env
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require"
```

Session pooler cocok bila komputer hanya memiliki koneksi IPv4. Direct connection juga dapat digunakan bila jaringan mendukungnya.

### Password dengan karakter khusus

Password pada URL wajib di-URL-encode. Contoh:

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `/` → `%2F`
- `:` → `%3A`

Jangan mengubah karakter lain pada connection string.

---

## 4. Ambil URL dan API keys Supabase

Buka **Project Settings → API Keys** atau bagian API pada dashboard.

Salin:

1. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.
2. **Publishable key** yang diawali `sb_publishable_` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. **Secret key** yang diawali `sb_secret_` → `SUPABASE_SECRET_KEY`.

Publishable key hanya dipakai browser untuk channel Realtime yang tidak membawa data sensitif. Secret key hanya boleh berada pada server. Jangan pernah memberi prefix `NEXT_PUBLIC_` pada secret key.

Buka **Realtime Settings** dan pastikan public channels diizinkan. Implementasi ini memakai public channel hanya untuk metadata invalidasi non-sensitif; seluruh record kesehatan tetap diambil melalui server/API terlindungi.

---

## 5. Ekstrak dan instal project

1. Ekstrak ZIP.
2. Buka terminal pada folder yang langsung berisi `package.json`.
3. Jalankan:

```bash
npm ci
```

Salin template environment:

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

### Windows Command Prompt

```bat
copy .env.example .env.local
notepad .env.local
```

### macOS/Linux

```bash
cp .env.example .env.local
```

---

## 6. Isi `.env.local`

Gunakan struktur berikut dan ganti seluruh placeholder:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require"

NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."

SUPABASE_STORAGE_BUCKET="posyandu-aster-public"
SUPABASE_PRIVATE_STORAGE_BUCKET="posyandu-aster-private"

JWT_SECRET="RANDOM_MINIMAL_32_KARAKTER"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

SEED_ADMIN_NAME="Administrator"
SEED_ADMIN_EMAIL="admin@domain-anda.id"
SEED_ADMIN_PASSWORD="PASSWORD_ADMIN_KUAT"
SEED_KADER_NAME="Kader Aster"
SEED_KADER_EMAIL="kader@domain-anda.id"
SEED_USER_PASSWORD="PASSWORD_KADER_KUAT"
```

Buat `JWT_SECRET` acak. Contoh pada terminal yang memiliki OpenSSL:

```bash
openssl rand -hex 32
```

Gunakan password Admin/Kader yang unik, minimal 12 karakter, dan jangan sama dengan database password.

---

## 7. Jalankan setup sekali jalan

Pilih **satu** jalur berikut. Jangan menjalankan keduanya pada database yang sama.

### Jalur A — project baru tanpa data lama

```bash
npm run supabase:bootstrap
```

### Jalur B — pindahkan PostgreSQL lokal lama

Jalur ini memerlukan PostgreSQL Client Tools (`pg_dump` dan `psql`). Isi variabel berikut pada `.env.local`:

```env
OLD_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/NAMA_DATABASE_LAMA"
```

Pastikan project Supabase target masih kosong, lalu jalankan:

```bash
npm run supabase:bootstrap:from-local
```

Perintah Jalur B akan membuat schema terbaru di Supabase, memindahkan isi tabel dari PostgreSQL lama, menyelaraskan sequence ID, melengkapi master data yang belum ada, kemudian memeriksa RLS, Realtime, dan Storage. Script akan berhenti bila mendeteksi database target sudah berisi record utama untuk mencegah duplikasi.

> Migrasi database tidak otomatis memindahkan file lama yang berada di luar database. Pada paket sumber ini folder `public/uploads` kosong. Bila instalasi lama memiliki file aktual, unggah file tersebut melalui modul aplikasi/Supabase Storage dan pastikan URL record terkait diperbarui sebelum go-live.

### Proses otomatis

Perintah setup menjalankan proses berikut secara berurutan:

1. memvalidasi environment;
2. membuat Prisma Client;
3. menjalankan semua migration;
4. membuat enum, tabel, kolom, relasi, indeks, dan foreign key;
5. mengaktifkan RLS dan mencabut akses Data API browser ke tabel aplikasi;
6. membuat distributed rate limit di Postgres;
7. membuat fungsi dan trigger Supabase Realtime;
8. memasukkan master kategori, profil awal, serta akun Admin/Kader;
9. membuat/memeriksa bucket public dan private;
10. memeriksa koneksi, RLS, privilege, trigger, bucket, dan pola cloud-only.

Seed production **tidak** memasukkan sasaran, pemeriksaan, absensi, produk, berita, dokumentasi, atau arsip fiktif.

### Alternatif Windows

Klik dua kali:

```text
SETUP-WINDOWS.cmd
```

Script tersebut membuat `.env.local` bila belum ada, membuka Notepad, memasang dependency, menjalankan bootstrap, lalu membuka development server.

---

## 8. Jalankan website

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

Login menggunakan email dan password seed dari `.env.local`. Akun awal dipaksa mengganti password pada login pertama.

Setelah login:

1. buka Pengaturan/Profil;
2. ganti nama Posyandu, alamat, telepon, email, jam layanan, dan logo;
3. buat akun petugas tambahan bila diperlukan;
4. nonaktifkan akun seed yang tidak lagi dipakai.

---

## 9. Periksa kesehatan sistem

Saat server berjalan, buka:

```text
http://localhost:3000/api/health
```

Atau jalankan:

```bash
APP_HEALTH_URL="http://localhost:3000/api/health" npm run health:check
```

Status sehat harus menunjukkan database terhubung serta Realtime dan Storage terkonfigurasi.

Jalankan pemeriksaan lengkap Supabase kapan pun dibutuhkan:

```bash
npm run supabase:check
npm run cloud:audit
npm run routes:check
```

---

## 10. Uji realtime dengan benar

1. Buka browser pertama dan login sebagai Admin/Kader.
2. Buka browser kedua, incognito, atau perangkat lain.
3. Pada keduanya buka halaman Sasaran, Monitoring, Absensi, atau Konten yang sama.
4. Tambah/ubah/hapus data dari browser pertama.
5. Browser kedua harus memperbarui tabel, ringkasan, dan grafik tanpa menekan refresh.
6. Badge navbar harus menunjukkan **Realtime aktif**.

Uji minimal:

- tambah sasaran;
- tambah pemeriksaan;
- buka grafik general;
- pilih nama pada grafik per individu;
- ubah data pemeriksaan dari browser lain;
- unggah dokumentasi;
- unggah arsip dan pastikan URL-nya sementara/private.

Realtime mencakup pengguna, reset password, master kategori, sasaran, lima kelompok monitoring, absensi/sesi QR, produk, dokumentasi, arsip, profil, berita, event, FAQ, dan audit log.

---

## 11. Grafik general dan per individu

Grafik tidak menggunakan data hardcoded. Grafik membaca pemeriksaan aktual dari Supabase.

- **Balita:** tren berat dan tinggi berdasarkan umur/riwayat, serta ringkasan general.
- **Ibu hamil:** indikator seperti berat, tekanan darah, Hb, LILA, dan usia kehamilan sesuai data yang tersedia.
- **Remaja:** berat, tinggi, LILA, Hb, dan status anemia.
- **Usia produktif:** berat, tinggi, BMI, lingkar pinggang, tekanan darah, gula darah, dan kolesterol.
- **Lansia:** indikator pemeriksaan yang didefinisikan pada schema dan form aplikasi.

Bila grafik kosong, tambahkan sasaran dan minimal satu pemeriksaan. Nama akan muncul pada pilihan grafik per individu berdasarkan data Supabase.

---

## 12. Kode tabel dan kolom

Sumber kebenaran database:

- `prisma/schema.prisma` — model, tipe, relasi, constraint, indeks;
- `prisma/migrations/` — SQL yang diterapkan oleh Prisma;
- `supabase/FULL-DATABASE-REFERENCE.sql` — seluruh migration digabung untuk inspeksi/manual fresh install;
- `docs/DATABASE-DICTIONARY.md` — daftar tabel dan kolom yang mudah dibaca;
- `supabase/REALTIME-AND-RATE-LIMIT.sql` — fungsi/trigger realtime dan rate limit.

### Cara yang direkomendasikan

Gunakan:

```bash
npm run supabase:bootstrap
```

### Cara manual melalui SQL Editor

Hanya gunakan bila Node/Prisma sama sekali tidak dapat dijalankan dan project Supabase benar-benar kosong:

1. buka SQL Editor Supabase;
2. salin seluruh isi `supabase/FULL-DATABASE-REFERENCE.sql`;
3. jalankan satu kali;
4. jalankan `npm run db:generate`;
5. jalankan `npm run db:seed`;
6. jalankan `npm run supabase:check`.

**Jangan** menjalankan SQL manual setelah `npm run db:migrate`, karena objek yang sama dapat dibuat dua kali dan history Prisma menjadi tidak sinkron.

---

## 13. Data demo hanya untuk staging

Pada project staging saja, data contoh dapat dimasukkan dengan:

```bash
npm run db:seed:demo
```

Jangan menjalankannya pada database production. Bila sudah terlanjur, hapus project/database staging dan ulangi instalasi production agar tidak ada data fiktif bercampur dengan data asli.

---

## 14. Deploy ke Vercel

1. Buat repository Git private.
2. Jangan commit `.env.local`.
3. Push project ke repository.
4. Import repository di Vercel.
5. Buka **Project Settings → Environment Variables**.
6. Masukkan seluruh variabel wajib dari `.env.local` untuk Production, Preview, dan Development sesuai kebutuhan.
7. Ubah:

```env
NEXT_PUBLIC_APP_URL="https://domain-production-anda"
```

8. Deploy.
9. Buka `https://domain-production-anda/api/health`.
10. Uji login, upload, CRUD, grafik, dan realtime memakai dua perangkat.

Migration pertama sebaiknya sudah dijalankan dari komputer administrator menggunakan `npm run supabase:bootstrap`. Untuk rilis berikutnya yang memiliki migration baru, jalankan:

```bash
npm run db:migrate
npm run supabase:check
```

sebelum atau melalui pipeline deployment yang terkendali.

---

## 15. Checklist production

- [ ] Project staging dan production terpisah.
- [ ] Database password tersimpan aman.
- [ ] `.env.local` tidak masuk Git.
- [ ] Secret key tidak memakai prefix `NEXT_PUBLIC_`.
- [ ] `NEXT_PUBLIC_APP_URL` memakai domain production.
- [ ] `npm run supabase:check` lulus.
- [ ] `/api/health` sehat.
- [ ] Login pertama memaksa ganti password.
- [ ] Profil Posyandu sudah diubah dari placeholder.
- [ ] Bucket public hanya untuk media publik.
- [ ] Arsip terbuka melalui signed URL sementara.
- [ ] Realtime diuji pada dua perangkat.
- [ ] Grafik general dan per individu diuji memakai data aktual.
- [ ] Security Advisor dan Performance Advisor Supabase diperiksa.
- [ ] Backup/PITR disesuaikan dengan paket dan kebutuhan organisasi.

---

## 16. Troubleshooting

### Prisma `P1001` / database tidak terjangkau

- Pastikan project aktif.
- Pastikan `DIRECT_URL` memakai Session Pooler port `5432`.
- Pastikan password sudah di-URL-encode.
- Salin ulang connection string dari tombol Connect; jangan mengetik host manual.

### Error prepared statement pada runtime

Pastikan `DATABASE_URL` memakai Transaction Pooler dan parameter:

```text
pgbouncer=true&connection_limit=1
```

### Badge realtime disabled/error

- Pastikan Project URL dan publishable key benar.
- Restart server setelah mengubah `.env.local`.
- Jalankan `npm run supabase:check`.
- Pastikan fungsi `notify_posyandu_realtime()` dan trigger ditemukan.

### Data berubah tetapi tampilan belum ikut berubah

- Pastikan halaman dibuka melalui build terbaru.
- Periksa console browser untuk koneksi WebSocket.
- Uji menggunakan dua tab setelah badge Realtime aktif.
- Pastikan perubahan dilakukan pada tabel yang masuk daftar trigger.

### Upload gagal

- Pastikan secret key benar dan hanya ada di server.
- Jalankan `npm run supabase:check` agar bucket dibuat/diperiksa.
- Batas default 10 MB; spreadsheet arsip 20 MB.
- Periksa ekstensi dan MIME file.

### Arsip tidak dapat dibuka

- Pastikan bucket `posyandu-aster-private` berstatus private.
- Jangan menyimpan URL signed lama; API membuat URL baru saat data arsip dibaca.
- Login sebagai role yang diizinkan.

### Grafik kosong

Ini bukan error fallback. Grafik hanya menampilkan data aktual Supabase. Tambahkan sasaran dan pemeriksaan yang sesuai.

---

## 17. Larangan penting

- Jangan menaruh `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`, atau `JWT_SECRET` di browser.
- Jangan mengaktifkan grant CRUD publik pada tabel kesehatan.
- Jangan menggunakan PostgreSQL localhost pada production.
- Jangan menyimpan upload pada disk Vercel.
- Jangan memakai `db:seed:demo` pada production.
- Jangan menjalankan SQL reference dan migration Prisma pada database yang sama.
- Jangan mengirim ZIP yang mengandung `.env.local` kepada pihak lain.
