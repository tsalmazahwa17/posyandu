import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
const publishableKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim();
const secretKey = (
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();
const publicBucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "posyandu-aster-public";
const privateBucket = process.env.SUPABASE_PRIVATE_STORAGE_BUCKET?.trim() || "posyandu-aster-private";

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exitCode = 1;
}

function storageHeaders(extra = {}) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    ...extra,
  };
}

async function ensureBucket(bucket, isPublic) {
  const getResponse = await fetch(
    `${supabaseUrl}/storage/v1/bucket/${encodeURIComponent(bucket)}`,
    { headers: storageHeaders() }
  );

  if (getResponse.ok) {
    const data = await getResponse.json();
    if (Boolean(data.public) !== isPublic) {
      throw new Error(`Bucket "${bucket}" harus berstatus ${isPublic ? "public" : "private"}.`);
    }
    console.log(`✓ Supabase Storage: bucket ${isPublic ? "public" : "private"} "${bucket}" siap`);
    return;
  }

  if (getResponse.status !== 404) {
    throw new Error(`Gagal membaca bucket (${getResponse.status}): ${await getResponse.text()}`);
  }

  const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: storageHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: isPublic,
      file_size_limit: 20 * 1024 * 1024,
      allowed_mime_types: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "text/plain",
        "application/csv",
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ],
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Gagal membuat bucket (${createResponse.status}): ${await createResponse.text()}`);
  }

  console.log(`✓ Supabase Storage: bucket ${isPublic ? "public" : "private"} "${bucket}" berhasil dibuat`);
}

async function verifyDatabase(prisma) {
  await prisma.$queryRaw`SELECT 1`;
  console.log("✓ Supabase Postgres: koneksi Prisma berhasil");

  const rateLimitTable = await prisma.$queryRaw`
    SELECT to_regclass('public.rate_limit_buckets')::text AS name
  `;
  if (!rateLimitTable[0]?.name) throw new Error("Tabel rate_limit_buckets belum dibuat.");
  console.log("✓ Distributed rate limit: tabel Supabase siap");

  const realtimeFunction = await prisma.$queryRaw`
    SELECT to_regprocedure('public.notify_posyandu_realtime()')::text AS name
  `;
  if (!realtimeFunction[0]?.name) throw new Error("Fungsi Realtime belum dibuat.");

  const expectedRealtimeTables = [
    "users",
    "password_reset_requests",
    "categories",
    "archive_categories",
    "visitors",
    "monitoring_balita",
    "monitoring_ibu_hamil",
    "monitoring_remaja",
    "monitoring_usia_produktif",
    "monitoring_lansia",
    "attendances",
    "posyandu_sessions",
    "products",
    "documentations",
    "archives",
    "profiles",
    "news_categories",
    "news",
    "events",
    "faqs",
    "audit_logs",
  ];
  const triggerRows = await prisma.$queryRaw`
    SELECT c.relname AS table_name, t.tgname AS trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT t.tgisinternal
      AND n.nspname = 'public'
      AND t.tgname LIKE 'trg_%_realtime'
  `;
  const triggerTables = new Set(triggerRows.map((row) => row.table_name));
  const missingTriggers = expectedRealtimeTables.filter((table) => !triggerTables.has(table));
  if (missingTriggers.length > 0) {
    throw new Error(`Trigger Realtime belum lengkap pada: ${missingTriggers.join(", ")}.`);
  }
  console.log(`✓ Supabase Realtime: fungsi + ${expectedRealtimeTables.length} trigger tabel aktif`);

  const exposedTables = await prisma.$queryRaw`
    SELECT count(*)::int AS count
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated')
      AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
      AND table_name <> '_prisma_migrations'
  `;
  const exposedCount = Number(exposedTables[0]?.count || 0);
  if (exposedCount > 0) {
    throw new Error(`Masih ada ${exposedCount} grant Data API yang tidak diharapkan.`);
  }
  console.log("✓ RLS/Data API: tabel kesehatan tidak terbuka langsung ke browser");

  const rlsRows = await prisma.$queryRaw`
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> '_prisma_migrations'
      AND c.relname NOT LIKE 'pg_%'
  `;
  const withoutRls = rlsRows
    .filter((row) => !row.rls_enabled)
    .map((row) => row.table_name);
  if (withoutRls.length > 0) {
    throw new Error(`RLS belum aktif pada tabel: ${withoutRls.join(", ")}.`);
  }
  console.log(`✓ RLS aktif pada ${rlsRows.length} tabel aplikasi`);
}

async function main() {
  console.log("\nPosyandu Aster — pemeriksaan Supabase production\n");

  if (!supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) {
    fail("NEXT_PUBLIC_SUPABASE_URL belum valid.");
    return;
  }
  if (!publishableKey) {
    fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diisi untuk Realtime browser.");
    return;
  }
  if (!secretKey) {
    fail("SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY belum diisi.");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await verifyDatabase(prisma);
    await ensureBucket(publicBucket, true);
    await ensureBucket(privateBucket, false);
    console.log("✓ Realtime browser: URL dan publishable key tersedia");
    console.log("\nSemua layanan Supabase production siap digunakan.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
