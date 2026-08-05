-- Distributed rate limiting: replaces process-local memory with Supabase Postgres.
CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
  "key" VARCHAR(255) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "reset_at" TIMESTAMP(3) NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "rate_limit_buckets_reset_at_idx"
ON "rate_limit_buckets"("reset_at");

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.rate_limit_buckets FROM anon, authenticated;

-- Keeps expired limiter keys from accumulating indefinitely.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE reset_at < now() - interval '1 day';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_rate_limit_buckets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_buckets() TO postgres, service_role;

-- Secure real-time invalidation. The public broadcast contains no health,
-- identity, password, or document payload. Authenticated application pages
-- receive only the table name and operation, then re-fetch through protected
-- Next.js server/API routes.
CREATE OR REPLACE FUNCTION public.notify_posyandu_realtime()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, realtime
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'changedAt', timezone('utc', now())
    ),
    'data_changed',
    'posyandu:changes',
    false
  );
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_posyandu_realtime() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_posyandu_realtime() TO postgres, service_role;

DO $$
DECLARE
  table_name text;
  realtime_tables text[] := ARRAY[
    'users',
    'password_reset_requests',
    'categories',
    'archive_categories',
    'visitors',
    'monitoring_balita',
    'monitoring_ibu_hamil',
    'monitoring_remaja',
    'monitoring_usia_produktif',
    'monitoring_lansia',
    'attendances',
    'posyandu_sessions',
    'products',
    'documentations',
    'archives',
    'profiles',
    'news_categories',
    'news',
    'events',
    'faqs',
    'audit_logs'
  ];
BEGIN
  FOREACH table_name IN ARRAY realtime_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_' || table_name || '_realtime', table_name);
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.notify_posyandu_realtime()',
        'trg_' || table_name || '_realtime',
        table_name
      );
    END IF;
  END LOOP;
END
$$;
