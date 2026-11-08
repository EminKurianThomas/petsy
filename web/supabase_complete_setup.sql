-- ═══════════════════════════════════════════════════════════════════════════
--  PETSY — Complete Database Schema & Admin Setup  v2.0
--  Paste and RUN this once in: Supabase Dashboard › SQL Editor › New query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Tables ────────────────────────────────────────────────────────────────

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL DEFAULT '',
  email         TEXT        NOT NULL DEFAULT '',
  active_pet_id UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure email column exists if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';

-- Admins table
CREATE TABLE IF NOT EXISTS public.admins (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pets table
CREATE TABLE IF NOT EXISTS public.pets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  species        TEXT        NOT NULL DEFAULT 'Dog',
  breed          TEXT        NOT NULL DEFAULT '',
  gender         TEXT        NOT NULL DEFAULT 'Male',
  age            TEXT        NOT NULL DEFAULT '',
  weight         FLOAT       NOT NULL DEFAULT 0,
  weight_unit    TEXT        NOT NULL DEFAULT 'kg',
  color          TEXT        NOT NULL DEFAULT '#1F5C4A',
  avatar         TEXT        NOT NULL DEFAULT '',
  next_vet       TEXT        NOT NULL DEFAULT '',
  microchip      TEXT        NOT NULL DEFAULT '',
  insurance      TEXT        NOT NULL DEFAULT '',
  emergency_vet  TEXT        NOT NULL DEFAULT '',
  food_title     TEXT        NOT NULL DEFAULT 'Not set yet',
  food_desc      TEXT        NOT NULL DEFAULT 'Add feeding guidance in the pet profile.',
  exercise_title TEXT        NOT NULL DEFAULT 'Not set yet',
  exercise_desc  TEXT        NOT NULL DEFAULT 'Add exercise guidance in the pet profile.',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weight history
CREATE TABLE IF NOT EXISTS public.weight_history (
  id          BIGSERIAL   PRIMARY KEY,
  pet_id      UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  weight      FLOAT       NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cat         TEXT        NOT NULL DEFAULT 'vet',
  title       TEXT        NOT NULL,
  meta        TEXT        NOT NULL DEFAULT '',
  due_date    TEXT        NOT NULL DEFAULT '',
  recurring   TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'upcoming',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medical & health records
CREATE TABLE IF NOT EXISTS public.records (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL DEFAULT 'treatments',
  title      TEXT        NOT NULL,
  meta       TEXT        NOT NULL DEFAULT '',
  doctor     TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records        ENABLE ROW LEVEL SECURITY;

-- ─── 3. Functions ─────────────────────────────────────────────────────────────

-- is_admin() — checks if calling user is in admins table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- promote_to_admin(email) — securely promotes email to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE LOWER(email) = LOWER(target_email);
  IF target_id IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO public.admins (user_id) VALUES (target_id) ON CONFLICT DO NOTHING;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_to_admin(TEXT) TO anon, authenticated;

-- admin_get_users() — gets all users and pet counts for admin dashboard
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE (
  id         UUID,
  email      TEXT,
  name       TEXT,
  pet_count  BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    p.id,
    u.email::TEXT,
    p.name::TEXT,
    COUNT(pet.id)::BIGINT AS pet_count,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.pets pet ON pet.user_id = p.id
  GROUP BY p.id, u.email, p.name, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_users() TO authenticated;

-- ─── 4. Policies (User + Admin Access) ────────────────────────────────────────

-- Clean up any existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "pets_all" ON public.pets;
DROP POLICY IF EXISTS "admin_pets_select" ON public.pets;
DROP POLICY IF EXISTS "weight_history_all" ON public.weight_history;
DROP POLICY IF EXISTS "admin_weight_history_select" ON public.weight_history;
DROP POLICY IF EXISTS "reminders_all" ON public.reminders;
DROP POLICY IF EXISTS "admin_reminders_select" ON public.reminders;
DROP POLICY IF EXISTS "records_all" ON public.records;
DROP POLICY IF EXISTS "admin_records_select" ON public.records;
DROP POLICY IF EXISTS "admins_read" ON public.admins;

-- Profiles: user can view/update own; admin can view all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins table: read own status
CREATE POLICY "admins_read" ON public.admins
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Pets: owner full access, admin view access
CREATE POLICY "pets_all" ON public.pets
  FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- Weight history: linked to pet ownership, admin view access
CREATE POLICY "weight_history_all" ON public.weight_history
  FOR ALL
  USING (pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid()) OR public.is_admin())
  WITH CHECK (pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid()));

-- Reminders: owner full access, admin view access
CREATE POLICY "reminders_all" ON public.reminders
  FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- Records: owner full access, admin view access
CREATE POLICY "records_all" ON public.records
  FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- ─── 5. Trigger: Auto-populate profile on new auth signup ────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE profiles.name END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── 6. Seed Admin Account (admin@gmail.com / Admin@123) ──────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
BEGIN
  -- 1. Remove any old or broken admin record
  DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@gmail.com');
  DELETE FROM public.admins   WHERE user_id IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@gmail.com');
  DELETE FROM public.profiles WHERE id      IN (SELECT id FROM auth.users WHERE LOWER(email) = 'admin@gmail.com');
  DELETE FROM auth.users      WHERE LOWER(email) = 'admin@gmail.com';

  -- 2. Insert into auth.users
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

  -- 3. Insert into auth.identities (Mandatory for GoTrue password authentication)
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

  -- 4. Add to admins table
  INSERT INTO public.admins (user_id)
  VALUES (v_admin_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Add to profiles table
  INSERT INTO public.profiles (id, name, email)
  VALUES (v_admin_id, 'Admin', 'admin@gmail.com')
  ON CONFLICT (id) DO UPDATE SET email = 'admin@gmail.com', name = 'Admin';

END;
$$;

