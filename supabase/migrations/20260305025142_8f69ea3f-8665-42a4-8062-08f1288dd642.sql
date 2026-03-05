
-- Fix recursive RLS on super_admins: allow user to see their own row by email
DROP POLICY IF EXISTS "Super admins can read" ON public.super_admins;
CREATE POLICY "User can check own super admin status" ON public.super_admins
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Allow super admin to update shops (for suspend/unpublish)
CREATE POLICY "Super admin can update all shops" ON public.shops
  FOR UPDATE USING (public.is_super_admin());

-- Allow super admin to delete shops
CREATE POLICY "Super admin can delete shops" ON public.shops
  FOR DELETE USING (public.is_super_admin());

-- Allow super admin to delete memberships (cascade cleanup)
CREATE POLICY "Super admin can delete all memberships" ON public.memberships
  FOR DELETE USING (public.is_super_admin());

-- Allow super admin to delete barbers
CREATE POLICY "Super admin can delete all barbers" ON public.barbers
  FOR DELETE USING (public.is_super_admin());

-- Allow super admin to delete services
CREATE POLICY "Super admin can delete all services" ON public.services
  FOR DELETE USING (public.is_super_admin());

-- Allow super admin to delete appointments
CREATE POLICY "Super admin can delete all appointments" ON public.appointments
  FOR DELETE USING (public.is_super_admin());

-- Allow super admin to delete working_hours
CREATE POLICY "Super admin can delete all working_hours" ON public.working_hours
  FOR DELETE USING (public.is_super_admin());

-- Allow super admin to delete blocked_slots  
CREATE POLICY "Super admin can delete all blocked_slots" ON public.blocked_slots
  FOR DELETE USING (public.is_super_admin());
