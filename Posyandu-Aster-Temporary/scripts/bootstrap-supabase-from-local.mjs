import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
function run(label, args) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npm, args, { stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) {
    console.error(`\nMigrasi berhenti pada tahap: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nPosyandu Aster — Bootstrap Supabase dari PostgreSQL Lokal\n");
run("Validasi environment", ["run", "doctor"]);
run("Generate Prisma Client", ["run", "db:generate"]);
run("Buat schema Supabase, RLS, rate limit, dan trigger Realtime", ["run", "db:migrate"]);
run("Pindahkan data PostgreSQL lokal", ["run", "db:migrate:local-data"]);
run("Lengkapi master data dan akun awal bila belum ada", ["run", "db:seed"]);
run("Verifikasi database, storage, dan realtime", ["run", "supabase:check"]);
run("Audit cloud-only", ["run", "cloud:audit"]);
console.log("\n✓ Migrasi lama ke Supabase selesai. Jalankan npm run dev dan uji seluruh data.\n");
