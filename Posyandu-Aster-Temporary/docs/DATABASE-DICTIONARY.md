# Kamus Database Posyandu Aster

Dokumen ini dibuat dari `prisma/schema.prisma`. Nama kolom database mengikuti `@map`; detail constraint, indeks, dan foreign key yang final tetap mengacu pada schema dan migration SQL.

**Jumlah model/tabel:** 22  
**Jumlah enum:** 7

## Enum

### `Role`

`ADMIN`, `KADER`, `MASYARAKAT`

### `Gender`

`MALE`, `FEMALE`

### `AttendanceMethod`

`QR`, `MANUAL`

### `AttendanceStatus`

`HADIR`, `TIDAK_HADIR`

### `SessionStatus`

`OPEN`, `CLOSED`

### `MediaType`

`PHOTO`, `VIDEO`

### `PasswordResetStatus`

`PENDING`, `RESOLVED`, `REJECTED`

## Tabel dan kolom

### `users` (model `User`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `fullName` | `full_name` | `String / VarChar(100)` | — |
| `email` | `email` | `String / VarChar(150)` | UNIQUE |
| `password` | `password` | `String / VarChar(255)` | — |
| `role` | `role` | `Role` | default `KADER` |
| `isActive` | `is_active` | `Boolean` | default `true` |
| `mustChangePassword` | `must_change_password` | `Boolean` | default `true` |
| `passwordChangedAt` | `password_changed_at` | `DateTime?` | — |
| `visitorId` | `visitor_id` | `Int?` | UNIQUE |
| `visitor` | `visitor` | `Visitor?` | FK/relation |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `archives` | `archives` | `Archive[]` | relation list |
| `documentations` | `documentations` | `Documentation[]` | relation list |
| `recordedBalita` | `recordedBalita` | `MonitoringBalita[]` | relation list |
| `recordedIbuHamil` | `recordedIbuHamil` | `MonitoringIbuHamil[]` | relation list |
| `recordedRemaja` | `recordedRemaja` | `MonitoringRemaja[]` | relation list |
| `recordedUsiaProduktif` | `recordedUsiaProduktif` | `MonitoringUsiaProduktif[]` | relation list |
| `recordedLansia` | `recordedLansia` | `MonitoringLansia[]` | relation list |
| `recordedAttendances` | `recordedAttendances` | `Attendance[]` | relation list |
| `news` | `news` | `News[]` | relation list |
| `passwordResetRequests` | `passwordResetRequests` | `PasswordResetRequest[]` | relation list |
| `openedSessions` | `openedSessions` | `PosyanduSession[]` | relation list |

### `password_reset_requests` (model `PasswordResetRequest`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `userId` | `user_id` | `Int?` | — |
| `email` | `email` | `String / VarChar(150)` | — |
| `status` | `status` | `PasswordResetStatus` | default `PENDING` |
| `requestedAt` | `requested_at` | `DateTime` | default `now(` |
| `handledAt` | `handled_at` | `DateTime?` | — |
| `notes` | `notes` | `String?` | — |
| `user` | `user` | `User?` | FK/relation |

### `categories` (model `Category`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `name` | `name` | `String / VarChar(50)` | UNIQUE |
| `description` | `description` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitors` | `visitors` | `Visitor[]` | relation list |

### `archive_categories` (model `ArchiveCategory`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `name` | `name` | `String / VarChar(50)` | UNIQUE |
| `description` | `description` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `archives` | `archives` | `Archive[]` | relation list |

### `visitors` (model `Visitor`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `categoryId` | `category_id` | `Int` | — |
| `nik` | `nik` | `String? / VarChar(20)` | UNIQUE |
| `fullName` | `full_name` | `String / VarChar(100)` | — |
| `gender` | `gender` | `Gender` | — |
| `birthPlace` | `birth_place` | `String? / VarChar(100)` | — |
| `birthDate` | `birth_date` | `DateTime / Date` | — |
| `phone` | `phone` | `String? / VarChar(20)` | — |
| `address` | `address` | `String?` | — |
| `qrCode` | `qr_code` | `String? / VarChar(255)` | UNIQUE |
| `photo` | `photo` | `String? / VarChar(255)` | — |
| `isActive` | `is_active` | `Boolean` | default `true` |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `user` | `user` | `User?` | — |
| `category` | `category` | `Category` | FK/relation |
| `monitoringBalita` | `monitoringBalita` | `MonitoringBalita[]` | relation list |
| `monitoringIbuHamil` | `monitoringIbuHamil` | `MonitoringIbuHamil[]` | relation list |
| `monitoringRemaja` | `monitoringRemaja` | `MonitoringRemaja[]` | relation list |
| `monitoringUsiaProduktif` | `monitoringUsiaProduktif` | `MonitoringUsiaProduktif[]` | relation list |
| `monitoringLansia` | `monitoringLansia` | `MonitoringLansia[]` | relation list |
| `attendances` | `attendances` | `Attendance[]` | relation list |

### `monitoring_balita` (model `MonitoringBalita`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `visitorId` | `visitor_id` | `Int` | — |
| `recordedBy` | `recorded_by` | `Int` | — |
| `examinationDate` | `examination_date` | `DateTime / Date` | — |
| `monthNumber` | `month_number` | `Int` | — |
| `ageMonth` | `age_month` | `Int` | — |
| `weight` | `weight` | `Decimal / Decimal(5, 2)` | — |
| `height` | `height` | `Decimal / Decimal(5, 2)` | — |
| `headCircumference` | `head_circumference` | `Decimal? / Decimal(5, 2)` | — |
| `nutritionalStatus` | `nutritional_status` | `String? / VarChar(30)` | — |
| `immunization` | `immunization` | `String? / VarChar(100)` | — |
| `vitamin` | `vitamin` | `String? / VarChar(50)` | — |
| `kpspResult` | `kpsp_result` | `String? / VarChar(100)` | — |
| `notes` | `notes` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitor` | `visitor` | `Visitor` | FK/relation |
| `recorder` | `recorder` | `User` | FK/relation |

### `monitoring_ibu_hamil` (model `MonitoringIbuHamil`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `visitorId` | `visitor_id` | `Int` | — |
| `recordedBy` | `recorded_by` | `Int` | — |
| `examinationDate` | `examination_date` | `DateTime / Date` | — |
| `gestationalAge` | `gestational_age` | `Int?` | — |
| `weight` | `weight` | `Decimal? / Decimal(5, 2)` | — |
| `systolicBP` | `systolic_bp` | `Int?` | — |
| `diastolicBP` | `diastolic_bp` | `Int?` | — |
| `hb` | `hb` | `Decimal? / Decimal(4, 2)` | — |
| `lila` | `lila` | `Decimal? / Decimal(5, 2)` | — |
| `hpht` | `hpht` | `DateTime? / Date` | — |
| `hpl` | `hpl` | `DateTime? / Date` | — |
| `notes` | `notes` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitor` | `visitor` | `Visitor` | FK/relation |
| `recorder` | `recorder` | `User` | FK/relation |

### `monitoring_remaja` (model `MonitoringRemaja`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `visitorId` | `visitor_id` | `Int` | — |
| `recordedBy` | `recorded_by` | `Int` | — |
| `examinationDate` | `examination_date` | `DateTime / Date` | — |
| `weight` | `weight` | `Decimal? / Decimal(5, 2)` | — |
| `height` | `height` | `Decimal? / Decimal(5, 2)` | — |
| `armCircumference` | `arm_circumference` | `Decimal? / Decimal(5, 2)` | — |
| `hb` | `hb` | `Decimal? / Decimal(4, 2)` | — |
| `anemiaStatus` | `anemia_status` | `String? / VarChar(30)` | — |
| `notes` | `notes` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitor` | `visitor` | `Visitor` | FK/relation |
| `recorder` | `recorder` | `User` | FK/relation |

### `monitoring_usia_produktif` (model `MonitoringUsiaProduktif`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `visitorId` | `visitor_id` | `Int` | — |
| `recordedBy` | `recorded_by` | `Int` | — |
| `examinationDate` | `examination_date` | `DateTime / Date` | — |
| `weight` | `weight` | `Decimal? / Decimal(5, 2)` | — |
| `height` | `height` | `Decimal? / Decimal(5, 2)` | — |
| `bmi` | `bmi` | `Decimal? / Decimal(5, 2)` | — |
| `waistCircumference` | `waist_circumference` | `Decimal? / Decimal(5, 2)` | — |
| `systolicBP` | `systolic_bp` | `Int?` | — |
| `diastolicBP` | `diastolic_bp` | `Int?` | — |
| `bloodSugar` | `blood_sugar` | `Decimal? / Decimal(5, 2)` | — |
| `cholesterol` | `cholesterol` | `Decimal? / Decimal(5, 2)` | — |
| `notes` | `notes` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitor` | `visitor` | `Visitor` | FK/relation |
| `recorder` | `recorder` | `User` | FK/relation |

### `monitoring_lansia` (model `MonitoringLansia`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `visitorId` | `visitor_id` | `Int` | — |
| `recordedBy` | `recorded_by` | `Int` | — |
| `examinationDate` | `examination_date` | `DateTime / Date` | — |
| `weight` | `weight` | `Decimal? / Decimal(5, 2)` | — |
| `systolicBP` | `systolic_bp` | `Int?` | — |
| `diastolicBP` | `diastolic_bp` | `Int?` | — |
| `bloodSugar` | `blood_sugar` | `Decimal? / Decimal(5, 2)` | — |
| `cholesterol` | `cholesterol` | `Decimal? / Decimal(5, 2)` | — |
| `uricAcid` | `uric_acid` | `Decimal? / Decimal(5, 2)` | — |
| `notes` | `notes` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitor` | `visitor` | `Visitor` | FK/relation |
| `recorder` | `recorder` | `User` | FK/relation |

### `attendances` (model `Attendance`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `visitorId` | `visitor_id` | `Int` | — |
| `recordedBy` | `recorded_by` | `Int?` | — |
| `sessionId` | `session_id` | `Int?` | — |
| `attendanceDate` | `attendance_date` | `DateTime / Date` | — |
| `attendanceTime` | `attendance_time` | `DateTime / Time(6)` | — |
| `method` | `method` | `AttendanceMethod` | default `QR` |
| `status` | `status` | `AttendanceStatus` | default `HADIR` |
| `notes` | `notes` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `visitor` | `visitor` | `Visitor` | FK/relation |
| `recorder` | `recorder` | `User?` | FK/relation |
| `session` | `session` | `PosyanduSession?` | FK/relation |

### `posyandu_sessions` (model `PosyanduSession`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `sessionDate` | `session_date` | `DateTime / Date` | — |
| `token` | `token` | `String / VarChar(64)` | UNIQUE |
| `status` | `status` | `SessionStatus` | default `OPEN` |
| `openedBy` | `opened_by` | `Int` | — |
| `openedAt` | `opened_at` | `DateTime` | default `now(` |
| `closedAt` | `closed_at` | `DateTime?` | — |
| `expiresAt` | `expires_at` | `DateTime?` | — |
| `notes` | `notes` | `String?` | — |
| `opener` | `opener` | `User` | FK/relation |
| `attendances` | `attendances` | `Attendance[]` | relation list |

### `products` (model `Product`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `name` | `name` | `String / VarChar(150)` | — |
| `description` | `description` | `String?` | — |
| `price` | `price` | `Decimal / Decimal(12, 2)` | — |
| `stock` | `stock` | `Int` | default `0` |
| `image` | `image` | `String? / VarChar(255)` | — |
| `isActive` | `is_active` | `Boolean` | default `true` |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |

### `documentations` (model `Documentation`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `title` | `title` | `String / VarChar(150)` | — |
| `description` | `description` | `String?` | — |
| `mediaType` | `media_type` | `MediaType` | default `PHOTO` |
| `fileUrl` | `file_url` | `String / VarChar(255)` | — |
| `activityDate` | `activity_date` | `DateTime / Date` | — |
| `uploadedBy` | `uploaded_by` | `Int` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `uploader` | `uploader` | `User` | FK/relation |

### `archives` (model `Archive`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `categoryId` | `category_id` | `Int` | — |
| `title` | `title` | `String / VarChar(150)` | — |
| `description` | `description` | `String?` | — |
| `fileUrl` | `file_url` | `String / VarChar(255)` | — |
| `uploadedBy` | `uploaded_by` | `Int` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `category` | `category` | `ArchiveCategory` | FK/relation |
| `uploader` | `uploader` | `User` | FK/relation |

### `profiles` (model `Profile`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `1` |
| `organizationName` | `organization_name` | `String / VarChar(150)` | — |
| `tagline` | `tagline` | `String? / VarChar(255)` | — |
| `vision` | `vision` | `String` | — |
| `mission` | `mission` | `String` | — |
| `history` | `history` | `String?` | — |
| `address` | `address` | `String` | — |
| `phone` | `phone` | `String? / VarChar(20)` | — |
| `email` | `email` | `String? / VarChar(150)` | — |
| `mapsEmbed` | `maps_embed` | `String?` | — |
| `logo` | `logo` | `String? / VarChar(255)` | — |
| `heroImage` | `hero_image` | `String? / VarChar(255)` | — |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |

### `news_categories` (model `NewsCategory`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `name` | `name` | `String / VarChar(100)` | UNIQUE |
| `slug` | `slug` | `String / VarChar(120)` | UNIQUE |
| `description` | `description` | `String?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `news` | `news` | `News[]` | relation list |

### `news` (model `News`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `categoryId` | `category_id` | `Int` | — |
| `authorId` | `author_id` | `Int` | — |
| `title` | `title` | `String / VarChar(255)` | — |
| `slug` | `slug` | `String / VarChar(255)` | UNIQUE |
| `excerpt` | `excerpt` | `String` | — |
| `content` | `content` | `String` | — |
| `thumbnail` | `thumbnail` | `String? / VarChar(255)` | — |
| `isPublished` | `is_published` | `Boolean` | default `false` |
| `publishedAt` | `published_at` | `DateTime?` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |
| `category` | `category` | `NewsCategory` | FK/relation |
| `author` | `author` | `User` | FK/relation |

### `events` (model `Event`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `title` | `title` | `String / VarChar(200)` | — |
| `description` | `description` | `String?` | — |
| `location` | `location` | `String? / VarChar(255)` | — |
| `startDate` | `start_date` | `DateTime` | — |
| `endDate` | `end_date` | `DateTime?` | — |
| `image` | `image` | `String? / VarChar(255)` | — |
| `isPublished` | `is_published` | `Boolean` | default `true` |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |

### `faqs` (model `FAQ`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `question` | `question` | `String` | — |
| `answer` | `answer` | `String` | — |
| `order` | `order` | `Int` | default `0` |
| `isActive` | `is_active` | `Boolean` | default `true` |
| `createdAt` | `created_at` | `DateTime` | default `now(` |
| `updatedAt` | `updated_at` | `DateTime` | — |

### `audit_logs` (model `AuditLog`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `id` | `id` | `Int` | PK, default `autoincrement(` |
| `action` | `action` | `String / VarChar(100)` | — |
| `userId` | `user_id` | `Int?` | — |
| `ipAddress` | `ip_address` | `String? / VarChar(50)` | — |
| `details` | `details` | `String? / Text` | — |
| `createdAt` | `created_at` | `DateTime` | default `now(` |

### `rate_limit_buckets` (model `RateLimitBucket`)

| Field Prisma | Kolom database | Tipe | Keterangan |
|---|---|---|---|
| `key` | `key` | `String / VarChar(255)` | PK |
| `count` | `count` | `Int` | default `0` |
| `resetAt` | `reset_at` | `DateTime` | — |
| `updatedAt` | `updated_at` | `DateTime` | — |

## Indeks, unique constraint, dan relasi

Daftar di atas berfokus pada kolom. Constraint komposit, indeks, aturan `ON UPDATE`/`ON DELETE`, dan urutan migration ada pada:

- `prisma/schema.prisma`
- `prisma/migrations/`
- `supabase/FULL-DATABASE-REFERENCE.sql`
