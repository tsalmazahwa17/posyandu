import fs from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), "app");
const endpointPattern = /^(page|route)\.(?:js|jsx|ts|tsx)$/;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function routeOf(file) {
  const relativeDirectory = path.relative(appDir, path.dirname(file));
  const segments = relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"))
    .map((segment) =>
      segment
        .replace(/^\[\.\.\..+\]$/, "[...]")
        .replace(/^\[\[\.\.\..+\]\]$/, "[[...]]")
        .replace(/^\[[^\]]+\]$/, "[]")
    );

  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

if (!fs.existsSync(appDir)) {
  console.error("Folder app tidak ditemukan.");
  process.exit(1);
}

const endpoints = walk(appDir).filter((file) => endpointPattern.test(path.basename(file)));
const routes = new Map();

for (const file of endpoints) {
  const route = routeOf(file);
  const kind = path.basename(file).startsWith("page.") ? "page" : "route";
  const key = `${kind}:${route}`;
  const list = routes.get(key) ?? [];
  list.push(path.relative(process.cwd(), file));
  routes.set(key, list);
}

const duplicates = [...routes.entries()].filter(([, files]) => files.length > 1);

if (duplicates.length > 0) {
  console.error("\nDitemukan endpoint yang menghasilkan URL sama:\n");
  for (const [key, files] of duplicates) {
    console.error(`  ${key}`);
    for (const file of files) console.error(`    - ${file}`);
  }
  process.exit(1);
}

const pageCount = endpoints.filter((file) => path.basename(file).startsWith("page.")).length;
const routeCount = endpoints.filter((file) => path.basename(file).startsWith("route.")).length;
console.log(`✓ Tidak ada konflik pada ${pageCount} halaman dan ${routeCount} route handler.`);
