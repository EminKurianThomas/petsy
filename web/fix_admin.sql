-- ═══════════════════════════════════════════════════════════════════════════
--  PETSY — Fix Admin Account (admin@gmail.com / Admin@123)
--  Paste and run this in Supabase Dashboard › SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
BEGIN
  -- 1. Remove any broken admin user to start completely fresh
  DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@gmail.com');
  DELETE FROM public.admins   WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@gmail.com');
  DELETE FROM public.profiles WHERE id      IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@gmail.com');
  DELETE FROM auth.users      WHERE LOWER(email) = 'admin@gmail.com';

  -- 2. Insert properly into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_admin_id,
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin"}'::jsonb,
    NOW(),
    NOW()
  );

  -- 3. Insert into auth.identities (MANDATORY for Supabase GoTrue login)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@gmail.com', 'email_verified', true),
    'email',
    v_admin_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  -- 4. Insert into public.admins
  INSERT INTO public.admins (user_id)
  VALUES (v_admin_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Insert into public.profiles
  INSERT INTO public.profiles (id, name, email)
  VALUES (v_admin_id, 'Admin', 'admin@gmail.com')
  ON CONFLICT (id) DO UPDATE SET email = 'admin@gmail.com', name = 'Admin';

  RAISE NOTICE 'Admin created successfully with ID: %', v_admin_id;
END;
$$;
