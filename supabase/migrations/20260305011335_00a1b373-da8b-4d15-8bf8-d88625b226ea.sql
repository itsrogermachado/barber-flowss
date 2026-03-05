
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- SHOPS
DROP POLICY IF EXISTS "Members can view own shop" ON public.shops;
DROP POLICY IF EXISTS "Owner/Admin can update own shop" ON public.shops;
DROP POLICY IF EXISTS "Public can view published shops" ON public.shops;

CREATE POLICY "Members can view own shop" ON public.shops FOR SELECT TO authenticated
USING (id IN (SELECT get_user_shop_ids(auth.uid())));

CREATE POLICY "Owner/Admin can update own shop" ON public.shops FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Public can view published shops" ON public.shops FOR SELECT TO anon, authenticated
USING (is_published = true);

-- MEMBERSHIPS
DROP POLICY IF EXISTS "Members can view own shop memberships" ON public.memberships;
DROP POLICY IF EXISTS "Owner/Admin can delete memberships" ON public.memberships;
DROP POLICY IF EXISTS "Owner/Admin can insert memberships" ON public.memberships;
DROP POLICY IF EXISTS "Owner/Admin can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "User can insert own membership" ON public.memberships;

CREATE POLICY "Members can view own shop memberships" ON public.memberships FOR SELECT TO authenticated
USING (shop_id IN (SELECT get_user_shop_ids(auth.uid())));

CREATE POLICY "Owner/Admin can delete memberships" ON public.memberships FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can insert memberships" ON public.memberships FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can update memberships" ON public.memberships FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "User can insert own membership" ON public.memberships FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- BARBERS
DROP POLICY IF EXISTS "Members can view shop barbers" ON public.barbers;
DROP POLICY IF EXISTS "Owner/Admin can delete barbers" ON public.barbers;
DROP POLICY IF EXISTS "Owner/Admin can manage barbers" ON public.barbers;
DROP POLICY IF EXISTS "Owner/Admin can update barbers" ON public.barbers;
DROP POLICY IF EXISTS "Public can view active barbers of published shops" ON public.barbers;

CREATE POLICY "Members can view shop barbers" ON public.barbers FOR SELECT TO authenticated
USING (shop_id IN (SELECT get_user_shop_ids(auth.uid())));

CREATE POLICY "Owner/Admin can delete barbers" ON public.barbers FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can manage barbers" ON public.barbers FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can update barbers" ON public.barbers FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Public can view active barbers of published shops" ON public.barbers FOR SELECT TO anon, authenticated
USING (is_active = true AND shop_id IN (SELECT id FROM shops WHERE is_published = true));

-- SERVICES
DROP POLICY IF EXISTS "Members can view shop services" ON public.services;
DROP POLICY IF EXISTS "Owner/Admin can delete services" ON public.services;
DROP POLICY IF EXISTS "Owner/Admin can manage services" ON public.services;
DROP POLICY IF EXISTS "Owner/Admin can update services" ON public.services;
DROP POLICY IF EXISTS "Public can view active services of published shops" ON public.services;

CREATE POLICY "Members can view shop services" ON public.services FOR SELECT TO authenticated
USING (shop_id IN (SELECT get_user_shop_ids(auth.uid())));

CREATE POLICY "Owner/Admin can delete services" ON public.services FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can manage services" ON public.services FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can update services" ON public.services FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Public can view active services of published shops" ON public.services FOR SELECT TO anon, authenticated
USING (is_active = true AND shop_id IN (SELECT id FROM shops WHERE is_published = true));

-- WORKING_HOURS
DROP POLICY IF EXISTS "Barber can manage own working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Barber can update own working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Members can view shop working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Owner/Admin can delete working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Owner/Admin can manage working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Owner/Admin can update working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Public can view working hours of published shops" ON public.working_hours;

CREATE POLICY "Barber can manage own working hours" ON public.working_hours FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Barber can update own working hours" ON public.working_hours FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Members can view shop working hours" ON public.working_hours FOR SELECT TO authenticated
USING (shop_id IN (SELECT get_user_shop_ids(auth.uid())));

CREATE POLICY "Owner/Admin can delete working hours" ON public.working_hours FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can manage working hours" ON public.working_hours FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can update working hours" ON public.working_hours FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Public can view working hours of published shops" ON public.working_hours FOR SELECT TO anon, authenticated
USING (shop_id IN (SELECT id FROM shops WHERE is_published = true));

-- BLOCKED_SLOTS
DROP POLICY IF EXISTS "Barber can delete own blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Barber can manage own blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Barber can update own blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Members can view shop blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Owner/Admin can delete blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Owner/Admin can manage blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Owner/Admin can update blocked slots" ON public.blocked_slots;

CREATE POLICY "Barber can delete own blocked slots" ON public.blocked_slots FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Barber can manage own blocked slots" ON public.blocked_slots FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Barber can update own blocked slots" ON public.blocked_slots FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Members can view shop blocked slots" ON public.blocked_slots FOR SELECT TO authenticated
USING (shop_id IN (SELECT get_user_shop_ids(auth.uid())));

CREATE POLICY "Owner/Admin can delete blocked slots" ON public.blocked_slots FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can manage blocked slots" ON public.blocked_slots FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can update blocked slots" ON public.blocked_slots FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- APPOINTMENTS
DROP POLICY IF EXISTS "Barber can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Barber can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Owner/Admin can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Owner/Admin can view shop appointments" ON public.appointments;

CREATE POLICY "Barber can update own appointments" ON public.appointments FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Barber can view own appointments" ON public.appointments FOR SELECT TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) = 'BARBER' AND barber_id = get_user_barber_id(auth.uid(), shop_id));

CREATE POLICY "Owner/Admin can update appointments" ON public.appointments FOR UPDATE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can view shop appointments" ON public.appointments FOR SELECT TO authenticated
USING (shop_id IN (SELECT get_user_shop_ids(auth.uid())) AND get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- INVITATIONS
DROP POLICY IF EXISTS "Anyone can read invitation by token" ON public.invitations;
DROP POLICY IF EXISTS "Owner/Admin can delete invitations" ON public.invitations;
DROP POLICY IF EXISTS "Owner/Admin can insert invitations" ON public.invitations;
DROP POLICY IF EXISTS "Owner/Admin can manage invitations" ON public.invitations;

CREATE POLICY "Anyone can read invitation by token" ON public.invitations FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Owner/Admin can delete invitations" ON public.invitations FOR DELETE TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can insert invitations" ON public.invitations FOR INSERT TO authenticated
WITH CHECK (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owner/Admin can view invitations" ON public.invitations FOR SELECT TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- Allow anyone to update invitations (for accepting invites)
CREATE POLICY "Anyone can update invitations" ON public.invitations FOR UPDATE TO authenticated
USING (true);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Owner/Admin can view subscriptions" ON public.subscriptions;

CREATE POLICY "Owner/Admin can view subscriptions" ON public.subscriptions FOR SELECT TO authenticated
USING (get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- PLAN_LIMITS
DROP POLICY IF EXISTS "Anyone can read plan limits" ON public.plan_limits;

CREATE POLICY "Anyone can read plan limits" ON public.plan_limits FOR SELECT TO anon, authenticated
USING (true);
