import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const optional = process.argv.includes("--optional");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
const envFiles = [".env.local", ".env"];
const envFile = envFiles.find((file) => fs.existsSync(path.join(root, file)));

function stop(message, code = 1) {
  console.error(`\n${message}\n`);
  process.exit(code);
}

if (!fs.existsSync(prismaCli)) {
  if (optional) {
    console.log("[Prisma] CLI lokal belum tersedia; generation dilewati saat postinstall.");
    process.exit(0);
  }

  stop(
    [
      "Dependensi proyek belum terpasang.",
      "Jalankan `npm ci`, kemudian ulangi perintah ini.",
    ].join("\n")
  );
}

if (!envFile) {
  if (optional) {
    console.log("[Prisma] .env/.env.local belum ada; generation akan dijalankan saat npm run dev.");
    process.exit(0);
  }

  stop(
    [
      "File .env atau .env.local belum ditemukan.",
      "Salin .env dari proyek lama, atau jalankan:",
      "  Copy-Item .env.example .env",
      "Lalu isi DATABASE_URL, DIRECT_URL, konfigurasi Supabase, dan JWT_SECRET dengan nilai yang benar.",
    ].join("\n")
  );
}

console.log(`[Prisma] Menggunakan ${envFile} dan membuat Prisma Client...`);
const result = spawnSync(process.execPath, [prismaCli, "generate"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  stop(`Gagal menjalankan Prisma CLI: ${result.error.message}`);
}

process.exit(result.status ?? 1);
