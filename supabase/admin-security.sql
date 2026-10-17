-- Run this in the Supabase SQL Editor after creating your admin Auth user.
-- Replace the email in the final INSERT before running that statement.

CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = (SELECT auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DO $$
DECLARE
    policy_row record;
BEGIN
    FOR policy_row IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('leads', 'agents', 'team_members', 'portfolio_services', 'settings')
    LOOP
        EXECUTE format(
            'DROP POLICY %I ON %I.%I',
            policy_row.policyname,
            policy_row.schemaname,
            policy_row.tablename
        );
    END LOOP;
END;
$$;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.leads FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.agents FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.team_members FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.portfolio_services FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.settings FROM PUBLIC, anon, authenticated;

GRANT INSERT ON TABLE public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT ON TABLE public.agents TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.agents TO authenticated;
GRANT SELECT ON TABLE public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.team_members TO authenticated;
GRANT SELECT ON TABLE public.portfolio_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.portfolio_services TO authenticated;
GRANT SELECT (phone, email, address) ON TABLE public.settings TO anon;
GRANT SELECT (id, phone, email, address, seo_description) ON TABLE public.settings TO authenticated;
GRANT UPDATE (phone, email, address, seo_description) ON TABLE public.settings TO authenticated;

CREATE POLICY "Public may submit contact leads"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins may read leads"
ON public.leads FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins may update leads"
ON public.leads FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins may delete leads"
ON public.leads FOR DELETE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins manage agents"
ON public.agents FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public may read team"
ON public.team_members FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage team"
ON public.team_members FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public may read portfolio services"
ON public.portfolio_services FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage portfolio services"
ON public.portfolio_services FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public may read contact settings"
ON public.settings FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins may update settings"
ON public.settings FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin users manage site images" ON storage.objects;
CREATE POLICY "Admin users manage site images"
ON storage.objects FOR ALL TO authenticated
USING (
    bucket_id IN ('realisations', 'REALISATIONS')
    AND public.is_admin()
)
WITH CHECK (
    bucket_id IN ('realisations', 'REALISATIONS')
    AND public.is_admin()
);

DROP POLICY IF EXISTS "Only admins may insert site images" ON storage.objects;
CREATE POLICY "Only admins may insert site images"
ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK (
    bucket_id NOT IN ('realisations', 'REALISATIONS')
    OR (auth.role() = 'authenticated' AND public.is_admin())
);

DROP POLICY IF EXISTS "Only admins may update site images" ON storage.objects;
CREATE POLICY "Only admins may update site images"
ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (
    bucket_id NOT IN ('realisations', 'REALISATIONS')
    OR (auth.role() = 'authenticated' AND public.is_admin())
)
WITH CHECK (
    bucket_id NOT IN ('realisations', 'REALISATIONS')
    OR (auth.role() = 'authenticated' AND public.is_admin())
);

DROP POLICY IF EXISTS "Only admins may delete site images" ON storage.objects;
CREATE POLICY "Only admins may delete site images"
ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (
    bucket_id NOT IN ('realisations', 'REALISATIONS')
    OR (auth.role() = 'authenticated' AND public.is_admin())
);

-- After creating the Auth user, run this separately with its real email:
-- INSERT INTO public.admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL'
-- ON CONFLICT DO NOTHING;
