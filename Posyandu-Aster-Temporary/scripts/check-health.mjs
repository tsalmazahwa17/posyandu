import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const endpoint = `${baseUrl}/api/health`;

try {
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  console.log(`✓ Health check berhasil: ${endpoint}`);
  console.log(`  Database: ${payload.database}`);
  console.log(`  Realtime: ${payload.realtime}`);
  console.log(`  Storage: ${payload.storage}`);
  console.log(`  Latency: ${payload.latencyMs} ms`);
} catch (error) {
  console.error(`✗ Health check gagal pada ${endpoint}`);
  console.error(error instanceof Error ? error.message : String(error));
  console.error("Pastikan aplikasi sedang berjalan dan NEXT_PUBLIC_APP_URL benar.");
  process.exit(1);
}
