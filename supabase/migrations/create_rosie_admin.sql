-- =====================================================
-- Grant Admin Role to rosie.alanis@gmail.com
-- Run this in Supabase → SQL Editor
-- =====================================================

INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'rosie.alanis@gmail.com'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;
