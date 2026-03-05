
-- Security definer function to get user role in a shop (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_shop_role(_user_id uuid, _shop_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.memberships WHERE user_id = _user_id AND shop_id = _shop_id LIMIT 1;
$$;

-- Get barber_id for a user in a shop
CREATE OR REPLACE FUNCTION public.get_user_barber_id(_user_id uuid, _shop_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT barber_id FROM public.memberships WHERE user_id = _user_id AND shop_id = _shop_id LIMIT 1;
$$;

-- Get all shop_ids for a user
CREATE OR REPLACE FUNCTION public.get_user_shop_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id FROM public.memberships WHERE user_id = _user_id;
$$;

-- ============ RLS POLICIES ============

-- SHOPS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published shops" ON public.shops FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Members can view own shop" ON public.shops FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_shop_ids(auth.uid())));
CREATE POLICY "Owner/Admin can update own shop" ON public.shops FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Authenticated can insert shops" ON public.shops FOR INSERT TO authenticated
  WITH CHECK (true);

-- MEMBERSHIPS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own shop memberships" ON public.memberships FOR SELECT TO authenticated
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));
CREATE POLICY "Owner/Admin can insert memberships" ON public.memberships FOR INSERT TO authenticated
  WITH CHECK (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can update memberships" ON public.memberships FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can delete memberships" ON public.memberships FOR DELETE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
-- Allow user to insert their own membership (for signup trigger)
CREATE POLICY "User can insert own membership" ON public.memberships FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- BARBERS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active barbers of published shops" ON public.barbers FOR SELECT TO anon, authenticated
  USING (is_active = true AND shop_id IN (SELECT id FROM public.shops WHERE is_published = true));
CREATE POLICY "Members can view shop barbers" ON public.barbers FOR SELECT TO authenticated
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));
CREATE POLICY "Owner/Admin can manage barbers" ON public.barbers FOR INSERT TO authenticated
  WITH CHECK (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can update barbers" ON public.barbers FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can delete barbers" ON public.barbers FOR DELETE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- SERVICES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active services of published shops" ON public.services FOR SELECT TO anon, authenticated
  USING (is_active = true AND shop_id IN (SELECT id FROM public.shops WHERE is_published = true));
CREATE POLICY "Members can view shop services" ON public.services FOR SELECT TO authenticated
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));
CREATE POLICY "Owner/Admin can manage services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can update services" ON public.services FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can delete services" ON public.services FOR DELETE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- WORKING_HOURS
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view working hours of published shops" ON public.working_hours FOR SELECT TO anon, authenticated
  USING (shop_id IN (SELECT id FROM public.shops WHERE is_published = true));
CREATE POLICY "Members can view shop working hours" ON public.working_hours FOR SELECT TO authenticated
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));
CREATE POLICY "Owner/Admin can manage working hours" ON public.working_hours FOR INSERT TO authenticated
  WITH CHECK (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can update working hours" ON public.working_hours FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Barber can manage own working hours" ON public.working_hours FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );
CREATE POLICY "Barber can update own working hours" ON public.working_hours FOR UPDATE TO authenticated
  USING (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );
CREATE POLICY "Owner/Admin can delete working hours" ON public.working_hours FOR DELETE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- BLOCKED_SLOTS
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view shop blocked slots" ON public.blocked_slots FOR SELECT TO authenticated
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));
CREATE POLICY "Owner/Admin can manage blocked slots" ON public.blocked_slots FOR INSERT TO authenticated
  WITH CHECK (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can update blocked slots" ON public.blocked_slots FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can delete blocked slots" ON public.blocked_slots FOR DELETE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Barber can manage own blocked slots" ON public.blocked_slots FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );
CREATE POLICY "Barber can update own blocked slots" ON public.blocked_slots FOR UPDATE TO authenticated
  USING (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );
CREATE POLICY "Barber can delete own blocked slots" ON public.blocked_slots FOR DELETE TO authenticated
  USING (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );

-- APPOINTMENTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner/Admin can view shop appointments" ON public.appointments FOR SELECT TO authenticated
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())) AND public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Barber can view own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );
CREATE POLICY "Owner/Admin can update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Barber can update own appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (
    public.get_user_shop_role(auth.uid(), shop_id) = 'BARBER'
    AND barber_id = public.get_user_barber_id(auth.uid(), shop_id)
  );

-- SUBSCRIPTIONS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner/Admin can view subscriptions" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));

-- PLAN_LIMITS (public read)
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plan limits" ON public.plan_limits FOR SELECT TO anon, authenticated
  USING (true);

-- INVITATIONS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner/Admin can manage invitations" ON public.invitations FOR SELECT TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Owner/Admin can insert invitations" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Anyone can read invitation by token" ON public.invitations FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Owner/Admin can delete invitations" ON public.invitations FOR DELETE TO authenticated
  USING (public.get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN'));
