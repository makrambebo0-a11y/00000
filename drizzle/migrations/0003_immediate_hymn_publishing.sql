ALTER TABLE public.hymns ALTER COLUMN status SET DEFAULT 'approved';
COMMENT ON COLUMN public.hymns.status IS 'DEPRECATED approval workflow: new hymns publish immediately; retained for backwards compatibility.';
DROP POLICY IF EXISTS "public reads approved" ON public.hymns;
DROP POLICY IF EXISTS "anyone submits pending" ON public.hymns;
CREATE POLICY "public reads hymns" ON public.hymns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone publishes hymns" ON public.hymns FOR INSERT TO anon, authenticated WITH CHECK (status = 'approved');
GRANT SELECT, INSERT ON public.hymns TO anon, authenticated;
GRANT DELETE ON public.hymns TO authenticated;
GRANT ALL ON public.hymns TO service_role;