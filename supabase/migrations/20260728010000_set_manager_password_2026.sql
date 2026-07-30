INSERT INTO public.manager_credential (id, password_hash, salt, iterations, updated_at)
VALUES (
  1,
  '4e583d4e7fbb3252b9d76cc269650cd9319d4a3dbda777ec63d7fa43aaf3ddd2',
  '26e00db0c7a4049d586c8eeb4cd96560',
  120000,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = Ability@2026,
  salt = 26e00db0c7a4049d586c8eeb4cd96560,
  iterations = 120000,
  updated_at = now();
