import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const npmCli = process.env.npm_execpath;
const requiredFiles = [
  path.join(root, "node_modules", "next", "dist", "bin", "next"),
  path.join(root, "node_modules", "prisma", "build", "index.js"),
  path.join(root, "node_modules", "@prisma", "client", "package.json"),
];

function runNode(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`\nGagal menjalankan ${script}: ${result.error.message}\n`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (requiredFiles.some((file) => !fs.existsSync(file))) {
  console.log("\nDependensi belum terpasang. Menjalankan `npm ci` secara otomatis...\n");

  if (!npmCli || !fs.existsSync(npmCli)) {
    console.error("Tidak dapat menemukan npm CLI. Jalankan `npm ci` secara manual, lalu ulangi `npm run dev`.");
    process.exit(1);
  }

  runNode(npmCli, ["ci"]);
}

runNode(path.join(root, "scripts", "check-routes.mjs"));
runNode(path.join(root, "scripts", "generate-prisma.mjs"));
runNode(path.join(root, "node_modules", "next", "dist", "bin", "next"), [
  "dev",
  ...process.argv.slice(2),
]);
