-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Unique constraint: one review per appointment
ALTER TABLE public.reviews ADD CONSTRAINT reviews_appointment_unique UNIQUE (appointment_id);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public page)
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Anyone can insert a review (client submits after appointment)
CREATE POLICY "Anyone can insert review"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

-- Owner/Admin can delete reviews
CREATE POLICY "Owner/Admin can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    get_user_shop_role(auth.uid(), shop_id) IN ('OWNER', 'ADMIN')
    OR is_super_admin()
  );
