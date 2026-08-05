import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["app", "components", "hooks", "lib", "services", "prisma"];
const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".prisma"]);
const forbidden = [
  { pattern: /file:\/\/|sqlite:/i, label: "SQLite/local database URL" },
  { pattern: /public[\\/]uploads|writeFileSync|writeFile\(/i, label: "local filesystem upload" },
  { pattern: /postgres(?:ql)?:\/\/[^\s"']*(?:localhost|127\.0\.0\.1)/i, label: "local PostgreSQL URL" },
];

const findings = [];
function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name))) {
      const text = fs.readFileSync(full, "utf8");
      for (const rule of forbidden) {
        if (rule.pattern.test(text)) findings.push(`${path.relative(root, full)}: ${rule.label}`);
      }
    }
  }
}

for (const scanRoot of scanRoots) walk(path.join(root, scanRoot));

if (findings.length) {
  console.error("\n✗ Ditemukan ketergantungan penyimpanan/database lokal:");
  for (const finding of findings) console.error(`  - ${finding}`);
  process.exit(1);
}

console.log("✓ Tidak ditemukan database lokal atau upload filesystem lokal pada source aplikasi.");
console.log("✓ Data operasional, rate limit, audit log, dan file menggunakan layanan Supabase.");
