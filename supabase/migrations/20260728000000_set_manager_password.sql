-- Sets the manager account password.
-- Generated with the same pbkdf2 (sha256, 120000 iterations, 32-byte key) scheme
-- used by src/routes/api/public/manager/unlock.ts, so the app can verify it as-is.
INSERT INTO public.manager_credential (id, password_hash, salt, iterations, updated_at)
VALUES (
  1,
  '720727f76bc01ff1aa102cf751f720df0efd1e3cf6be9ceeb7435d322405f8be',
  '53a42c095f424159d1fbedd18d9f348c',
  120000,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  salt = EXCLUDED.salt,
  iterations = EXCLUDED.iterations,
  updated_at = now();
