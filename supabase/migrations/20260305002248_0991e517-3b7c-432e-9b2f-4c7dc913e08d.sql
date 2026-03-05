
-- 1) SHOPS
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Minha Barbearia',
  slug text UNIQUE NOT NULL,
  phone_whatsapp text,
  address text,
  instagram text,
  timezone text DEFAULT 'America/Sao_Paulo',
  slot_interval_minutes int DEFAULT 30,
  onboarding_completed boolean DEFAULT false,
  is_published boolean DEFAULT false,
  plan text DEFAULT 'trial',
  trial_ends_at timestamptz,
  subscription_status text,
  created_at timestamptz DEFAULT now()
);

-- 2) MEMBERSHIPS
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  role text NOT NULL,
  barber_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

-- 3) BARBERS
CREATE TABLE public.barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  photo_url text,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add FK from memberships.barber_id to barbers.id
ALTER TABLE public.memberships ADD CONSTRAINT memberships_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE SET NULL;

-- 4) SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_cents int NOT NULL,
  duration_minutes int NOT NULL,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5) WORKING_HOURS
CREATE TABLE public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  weekday int NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  break_start_time text,
  break_end_time text,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 6) BLOCKED_SLOTS
CREATE TABLE public.blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- 7) APPOINTMENTS
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id),
  client_name text NOT NULL,
  client_whatsapp text NOT NULL,
  notes text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- 8) SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_customer_id text,
  provider_subscription_id text,
  status text NOT NULL,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9) PLAN_LIMITS
CREATE TABLE public.plan_limits (
  plan text PRIMARY KEY,
  max_barbers int NOT NULL,
  max_appointments_month int NOT NULL,
  whatsapp_reminders_enabled boolean NOT NULL
);

INSERT INTO public.plan_limits (plan, max_barbers, max_appointments_month, whatsapp_reminders_enabled) VALUES
  ('trial', 2, 50, false),
  ('starter', 3, 200, false),
  ('pro', 10, 1000, true),
  ('scale', 50, 10000, true);

-- 10) INVITATIONS
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  role text NOT NULL,
  barber_id uuid,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_memberships_shop_id ON public.memberships(shop_id);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_barbers_shop_id ON public.barbers(shop_id);
CREATE INDEX idx_services_shop_id ON public.services(shop_id);
CREATE INDEX idx_working_hours_shop_barber_weekday ON public.working_hours(shop_id, barber_id, weekday);
CREATE INDEX idx_blocked_slots_shop_barber_start ON public.blocked_slots(shop_id, barber_id, start_at);
CREATE INDEX idx_appointments_shop_barber_start ON public.appointments(shop_id, barber_id, start_at);
CREATE INDEX idx_subscriptions_shop_id ON public.subscriptions(shop_id);
CREATE INDEX idx_invitations_shop_id ON public.invitations(shop_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
