-- Run once in the existing Supabase SQL editor, before enabling password recovery.
-- Both tables are server-only. No anonymous or authenticated client policies.
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  username text PRIMARY KEY,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.admin_password_resets (
  token_hash text PRIMARY KEY,
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_password_resets_rate
  ON public.admin_password_resets (email, created_at DESC);
ALTER TABLE public.admin_password_resets ENABLE ROW LEVEL SECURITY;

-- Access through SUPABASE_SERVICE_ROLE_KEY on the server only. Never expose the key.
