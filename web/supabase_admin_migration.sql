-- ═══════════════════════════════════════════════════════════════════════════
--  PETSY — Admin Migration  v1.0
--  Run this AFTER supabase_migration.sql in the Supabase Dashboard › SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Admins table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admins (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Add email column to profiles (for admin dashboard display) ────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';

-- ─── 3. Update new-user trigger to also persist email in profiles ─────────────
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
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- ─── 4. is_admin() — fast inline check ───────────────────────────────────────
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

-- ─── 5. promote_to_admin(email) — callable via RPC ───────────────────────────
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO public.admins (user_id) VALUES (target_id) ON CONFLICT DO NOTHING;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_to_admin(TEXT) TO anon, authenticated;

-- ─── 6. admin_get_users() — full user list with pet counts ───────────────────
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
    u.email,
    p.name,
    COUNT(pet.id) AS pet_count,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.pets pet ON pet.user_id = p.id
  GROUP BY p.id, u.email, p.name, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_users() TO authenticated;

-- ─── 7. Admin SELECT policies (admins can see ALL rows) ──────────────────────
CREATE POLICY "admin_profiles_select" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_pets_select" ON public.pets
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_weight_history_select" ON public.weight_history
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_reminders_select" ON public.reminders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_records_select" ON public.records
  FOR SELECT USING (public.is_admin());
