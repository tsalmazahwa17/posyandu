import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const sourceUrl = process.env.OLD_DATABASE_URL?.trim();
const targetUrl = process.env.DIRECT_URL?.trim();
const dumpFile = join(tmpdir(), `posyandu-aster-data-${randomUUID()}.sql`);

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function commandExists(command) {
  const checker = process.platform === "win32" ? "where" : "which";
  return spawnSync(checker, [command], { stdio: "ignore", shell: false }).status === 0;
}

function run(command, args, label, capture = false) {
  const result = spawnSync(command, args, {
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: capture ? "utf8" : undefined,
    shell: false,
    env: process.env,
  });
  if (result.status !== 0) fail(`${label} gagal.`);
  return capture ? String(result.stdout || "").trim() : "";
}

if (!sourceUrl) fail("OLD_DATABASE_URL belum diisi. Arahkan ke PostgreSQL lokal lama.");
if (!targetUrl) fail("DIRECT_URL belum diisi. Arahkan ke Session Pooler/direct Supabase.");
if (sourceUrl === targetUrl) fail("OLD_DATABASE_URL dan DIRECT_URL tidak boleh sama.");
if (!commandExists("pg_dump") || !commandExists("psql")) {
  fail("pg_dump dan psql belum tersedia. Instal PostgreSQL Client Tools lalu ulangi.");
}

console.log("\nPosyandu Aster — migrasi PostgreSQL lokal ke Supabase\n");

// Target must already have the Prisma schema, but no application data.
const targetCountSql = `
SELECT (
  (SELECT count(*) FROM public.users) +
  (SELECT count(*) FROM public.visitors) +
  (SELECT count(*) FROM public.monitoring_balita) +
  (SELECT count(*) FROM public.monitoring_ibu_hamil) +
  (SELECT count(*) FROM public.monitoring_remaja) +
  (SELECT count(*) FROM public.monitoring_usia_produktif) +
  (SELECT count(*) FROM public.monitoring_lansia) +
  (SELECT count(*) FROM public.attendances) +
  (SELECT count(*) FROM public.products) +
  (SELECT count(*) FROM public.documentations) +
  (SELECT count(*) FROM public.archives) +
  (SELECT count(*) FROM public.news)
)::bigint;
`;
const targetCount = Number(
  run("psql", [targetUrl, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", targetCountSql], "Pemeriksaan database target", true)
);
if (!Number.isFinite(targetCount)) fail("Jumlah data target tidak dapat dibaca.");
if (targetCount > 0) {
  fail(`Database Supabase target tidak kosong (${targetCount} record utama). Gunakan project kosong/backup terlebih dahulu.`);
}

try {
  console.log("1/3 Membuat data-only dump dari PostgreSQL lama...");
  run(
    "pg_dump",
    [
      sourceUrl,
      "--data-only",
      "--column-inserts",
      "--no-owner",
      "--no-privileges",
      "--schema=public",
      "--exclude-table=public._prisma_migrations",
      "--exclude-table=public.rate_limit_buckets",
      `--file=${dumpFile}`,
    ],
    "pg_dump"
  );

  console.log("2/3 Mengimpor data ke Supabase...");
  run(
    "psql",
    [targetUrl, "-X", "-v", "ON_ERROR_STOP=1", `--file=${dumpFile}`],
    "Import data ke Supabase"
  );

  console.log("3/3 Memastikan target berisi data...");
  const importedCount = Number(
    run("psql", [targetUrl, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", targetCountSql], "Verifikasi import", true)
  );
  console.log(`✓ Migrasi data selesai. ${importedCount.toLocaleString("id-ID")} record utama terdeteksi di Supabase.`);
  console.log("✓ Jalankan seed production sesudah ini untuk melengkapi master data yang belum ada.\n");
} finally {
  if (existsSync(dumpFile)) rmSync(dumpFile, { force: true });
}
