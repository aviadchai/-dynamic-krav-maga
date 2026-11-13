-- Run ONLY after SUPABASE_SERVICE_ROLE_KEY is set in Vercel and the site was redeployed.
-- Until then the site writes with the public anon key, and this would block saving.
-- Visitors keep read access; only the server (service role) may write.

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all write" ON public.seniors;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_content','articles','instructors','seniors'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND cmd='SELECT') THEN
      EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    END IF;
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;

-- Storage: the "uploads" bucket stays publicly readable (public bucket URLs),
-- but only the server may add, change or delete files.
DROP POLICY IF EXISTS "uploads_all" ON storage.objects;
CREATE POLICY "uploads_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'uploads');
