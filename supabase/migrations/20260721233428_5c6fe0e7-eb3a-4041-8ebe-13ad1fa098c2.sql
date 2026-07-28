CREATE TABLE public.manager_credential (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  iterations INTEGER NOT NULL DEFAULT 100000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.manager_credential TO service_role;
ALTER TABLE public.manager_credential ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (via server routes) can read/write this table.