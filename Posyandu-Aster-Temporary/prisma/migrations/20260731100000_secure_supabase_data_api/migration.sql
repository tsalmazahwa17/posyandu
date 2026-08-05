-- Posyandu Aster accesses application tables only through server-side Prisma.
-- Protect all application tables from direct Supabase Data API access.
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated', table_record.tablename);
  END LOOP;
END
$$;

DO $$
DECLARE
  sequence_record RECORD;
BEGIN
  FOR sequence_record IN
    SELECT sequencename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE public.%I FROM anon, authenticated', sequence_record.sequencename);
  END LOOP;
END
$$;
