import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];
const add = (ok, label, detail) => results.push({ ok, label, detail });

const nodeMajor = Number(process.versions.node.split(".")[0]);
add(nodeMajor >= 20, "Versi Node.js", `v${process.versions.node} (disarankan Node.js 20 atau lebih baru)`);

const envCandidates = [".env.local", ".env"];
const envFile = envCandidates.find((name) => fs.existsSync(path.join(root, name)));
add(Boolean(envFile), "Berkas environment", envFile ? `Menggunakan ${envFile}` : "Salin .env.example menjadi .env atau .env.local");

let env = {};
if (envFile) {
  const text = fs.readFileSync(path.join(root, envFile), "utf8");
  env = Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
      })
  );
}

const value = (name) => env[name] ?? process.env[name] ?? "";
const databaseUrl = value("DATABASE_URL");
const directUrl = value("DIRECT_URL");
const supabaseUrl = value("NEXT_PUBLIC_SUPABASE_URL");
const supabasePublishable = value("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || value("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseSecret = value("SUPABASE_SECRET_KEY") || value("SUPABASE_SERVICE_ROLE_KEY");
const storageBucket = value("SUPABASE_STORAGE_BUCKET");
const privateStorageBucket = value("SUPABASE_PRIVATE_STORAGE_BUCKET");
const jwtSecret = value("JWT_SECRET");
const appUrl = value("NEXT_PUBLIC_APP_URL");
const seedAdminEmail = value("SEED_ADMIN_EMAIL");
const seedAdminPassword = value("SEED_ADMIN_PASSWORD");
const seedKaderEmail = value("SEED_KADER_EMAIL");
const seedKaderPassword = value("SEED_USER_PASSWORD");
const passwordLooksReal = (password) =>
  password.length >= 10 && !/GANTI|CHANGE|YOUR|PASSWORD_|CONTOH/i.test(password);

add(
  /^postgres(ql)?:\/\//.test(databaseUrl) && /supabase/.test(databaseUrl) && !/PROJECT_REF|PASSWORD|REGION/.test(databaseUrl),
  "DATABASE_URL",
  databaseUrl ? "Koneksi runtime Supabase PostgreSQL terdeteksi" : "Belum diisi"
);
add(
  /^postgres(ql)?:\/\//.test(directUrl) && /supabase/.test(directUrl) && !/PROJECT_REF|PASSWORD|REGION/.test(directUrl),
  "DIRECT_URL",
  directUrl ? "Koneksi migrasi Supabase PostgreSQL terdeteksi" : "Belum diisi"
);
add(
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl),
  "NEXT_PUBLIC_SUPABASE_URL",
  supabaseUrl || "Belum diisi"
);
add(
  supabasePublishable.length >= 20 && !/GANTI|YOUR|PUBLISHABLE_KEY/i.test(supabasePublishable),
  "Supabase publishable key (Realtime)",
  supabasePublishable ? "Publishable/anon key terdeteksi" : "Isi NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
);
add(
  supabaseSecret.length >= 20 && !/GANTI|YOUR|SECRET_KEY_SUPABASE/i.test(supabaseSecret),
  "Supabase server secret",
  supabaseSecret ? "Secret server terdeteksi" : "Isi SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY"
);
add(
  /^[a-z0-9][a-z0-9._-]{1,62}$/i.test(storageBucket),
  "SUPABASE_STORAGE_BUCKET",
  storageBucket || "Belum diisi"
);
add(
  /^[a-z0-9][a-z0-9._-]{1,62}$/i.test(privateStorageBucket),
  "SUPABASE_PRIVATE_STORAGE_BUCKET",
  privateStorageBucket || "Belum diisi"
);
add(
  jwtSecret.length >= 32 && !/GANTI|CHANGE|YOUR|CONTOH/i.test(jwtSecret),
  "JWT_SECRET",
  jwtSecret ? `${jwtSecret.length} karakter` : "Belum diisi (minimal 32 karakter)"
);
add(
  /^https?:\/\//i.test(appUrl) && !/domain-|domain_anda|example/i.test(appUrl),
  "NEXT_PUBLIC_APP_URL",
  appUrl || "Belum diisi"
);
add(/^\S+@\S+\.\S+$/.test(seedAdminEmail), "SEED_ADMIN_EMAIL", seedAdminEmail || "Belum diisi");
add(passwordLooksReal(seedAdminPassword), "SEED_ADMIN_PASSWORD", seedAdminPassword ? `${seedAdminPassword.length} karakter` : "Belum diisi");
add(/^\S+@\S+\.\S+$/.test(seedKaderEmail), "SEED_KADER_EMAIL", seedKaderEmail || "Belum diisi");
add(passwordLooksReal(seedKaderPassword), "SEED_USER_PASSWORD", seedKaderPassword ? `${seedKaderPassword.length} karakter` : "Belum diisi");
add(fs.existsSync(path.join(root, "prisma", "schema.prisma")), "Skema Prisma", "prisma/schema.prisma");
add(fs.existsSync(path.join(root, "package-lock.json")), "Lockfile npm", "package-lock.json");

console.log("\nPosyandu Aster — pemeriksaan setup Supabase\n");
for (const item of results) {
  console.log(`${item.ok ? "✓" : "✗"} ${item.label}: ${item.detail}`);
}

const failed = results.filter((item) => !item.ok);
if (failed.length) {
  console.log("\nPerbaiki item bertanda ✗, lalu jalankan:");
  console.log("  npm ci");
  console.log("  npm run supabase:bootstrap\n");
  process.exitCode = 1;
} else {
  console.log("\nKonfigurasi dasar Supabase siap. Lanjutkan dengan npm run supabase:bootstrap.\n");
}
