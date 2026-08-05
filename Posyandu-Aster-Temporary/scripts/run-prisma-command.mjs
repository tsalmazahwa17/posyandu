import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const { loadEnvConfig } = nextEnv;
const root = process.cwd();
loadEnvConfig(root);

const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
if (!fs.existsSync(prismaCli)) {
  console.error("\nPrisma CLI belum tersedia. Jalankan `npm ci` terlebih dahulu.\n");
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("\nPerintah Prisma belum diberikan.\n");
  process.exit(1);
}

const result = spawnSync(process.execPath, [prismaCli, ...args], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

if (result.error) {
  console.error(`\nGagal menjalankan Prisma: ${result.error.message}\n`);
  process.exit(1);
}
process.exit(result.status ?? 1);
