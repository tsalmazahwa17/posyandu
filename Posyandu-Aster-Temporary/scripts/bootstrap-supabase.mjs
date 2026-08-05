import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(label, args) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npm, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`\nSetup berhenti pada tahap: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nPosyandu Aster — Bootstrap Supabase Production\n");
run("Validasi environment", ["run", "doctor"]);
run("Generate Prisma Client", ["run", "db:generate"]);
run("Buat/upgrade tabel, kolom, indeks, RLS, dan trigger Realtime", ["run", "db:migrate"]);
run("Isi data master dan akun awal", ["run", "db:seed"]);
run("Verifikasi database, storage, dan realtime", ["run", "supabase:check"]);
run("Audit cloud-only", ["run", "cloud:audit"]);

console.log("\n✓ Supabase selesai dipasang. Jalankan npm run dev atau deploy ke Vercel.\n");
