import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

interface RateLimitRow {
  count: number;
  reset_at: Date;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Distributed rate limiter backed by Supabase Postgres.
 * Safe across multiple Vercel/server instances and contains no process-local state.
 */
export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const newResetAt = new Date(now.getTime() + windowMs);

  const rows = await prisma.$queryRaw<RateLimitRow[]>`
    WITH cleanup AS (
      DELETE FROM "rate_limit_buckets"
      WHERE "reset_at" < ${new Date(now.getTime() - 24 * 60 * 60 * 1000)}
    )
    INSERT INTO "rate_limit_buckets" ("key", "count", "reset_at", "updated_at")
    VALUES (${key}, 1, ${newResetAt}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rate_limit_buckets"."reset_at" <= ${now} THEN 1
        ELSE "rate_limit_buckets"."count" + 1
      END,
      "reset_at" = CASE
        WHEN "rate_limit_buckets"."reset_at" <= ${now} THEN ${newResetAt}
        ELSE "rate_limit_buckets"."reset_at"
      END,
      "updated_at" = ${now}
    RETURNING "count", "reset_at";
  `;

  const row = rows[0];
  const count = row?.count ?? 1;
  const resetAt = row?.reset_at ?? newResetAt;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds,
    resetAt,
  };
}

export async function clearRateLimit(key: string): Promise<void> {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}

export async function checkRateLimit(
  identifier: string,
  request: Request,
  limit = 10,
  windowMs = 60_000
) {
  const key = `${identifier}:${clientIp(request)}`;
  const result = await consumeRateLimit(key, limit, windowMs);
  return {
    isLimited: !result.allowed,
    remaining: result.remaining,
    resetInSeconds: result.retryAfterSeconds,
  };
}

export function rateLimitResponse(resetInSeconds: number): NextResponse<ApiResponse> {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: `Terlalu banyak permintaan. Silakan coba lagi dalam ${resetInSeconds} detik.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(resetInSeconds),
        "Cache-Control": "no-store",
      },
    }
  );
}
