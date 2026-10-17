-- Run after admin-security.sql. This migration adds editable site details and
-- a workflow status to contact requests without changing existing records.

ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS opening_hours text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS facebook_url text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS instagram_url text NOT NULL DEFAULT '';

GRANT SELECT (phone, email, address, whatsapp, opening_hours, facebook_url, instagram_url)
ON TABLE public.settings TO anon;

GRANT SELECT (id, phone, email, address, seo_description, whatsapp, opening_hours, facebook_url, instagram_url)
ON TABLE public.settings TO authenticated;

GRANT UPDATE (phone, email, address, seo_description, whatsapp, opening_hours, facebook_url, instagram_url)
ON TABLE public.settings TO authenticated;

ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'nouvelle';

ALTER TABLE public.leads
    DROP CONSTRAINT IF EXISTS leads_status_check;

UPDATE public.leads
SET status = 'nouvelle'
WHERE status = 'nouveau';

ALTER TABLE public.leads
    ADD CONSTRAINT leads_status_check
    CHECK (status IN ('nouvelle', 'contactée', 'terminée'));

CREATE INDEX IF NOT EXISTS leads_status_created_at_idx
ON public.leads (status, created_at DESC);
