
-- Super admins table
CREATE TABLE public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can read this table
CREATE POLICY "Super admins can read" ON public.super_admins
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.super_admins)
  );

-- Insert the first super admin
INSERT INTO public.super_admins (email) VALUES ('rogermachado019@gmail.com');

-- Allow super admins to read ALL shops (bypass normal RLS)
CREATE POLICY "Super admin can view all shops" ON public.shops
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.super_admins)
  );

-- Allow super admins to read ALL memberships
CREATE POLICY "Super admin can view all memberships" ON public.memberships
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.super_admins)
  );

-- Allow super admins to read ALL barbers
CREATE POLICY "Super admin can view all barbers" ON public.barbers
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.super_admins)
  );

-- Allow super admins to read ALL services
CREATE POLICY "Super admin can view all services" ON public.services
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.super_admins)
  );

-- Allow super admins to read ALL appointments
CREATE POLICY "Super admin can view all appointments" ON public.appointments
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.super_admins)
  );

-- Security definer function to check super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE email = auth.jwt() ->> 'email'
  );
$$;
