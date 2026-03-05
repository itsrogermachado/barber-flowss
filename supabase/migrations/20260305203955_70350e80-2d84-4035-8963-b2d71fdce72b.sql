
CREATE OR REPLACE FUNCTION public.get_client_appointments(_shop_slug text, _client_whatsapp text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _shop record;
  _results jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO _shop FROM public.shops WHERE slug = _shop_slug AND is_published = true;
  IF _shop IS NULL THEN RETURN '[]'::jsonb; END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _results
  FROM (
    SELECT 
      a.id,
      a.start_at,
      a.end_at,
      a.status,
      a.client_name,
      a.notes,
      s.name as service_name,
      s.price_cents,
      b.name as barber_name
    FROM public.appointments a
    JOIN public.services s ON s.id = a.service_id
    JOIN public.barbers b ON b.id = a.barber_id
    WHERE a.shop_id = _shop.id
      AND a.client_whatsapp = _client_whatsapp
      AND a.start_at > now()
      AND a.status IN ('confirmed')
    ORDER BY a.start_at ASC
  ) t;

  RETURN _results;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_appointment_by_client(_appointment_id uuid, _client_whatsapp text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _appt record;
  _shop record;
  _barber record;
  _service record;
BEGIN
  SELECT * INTO _appt FROM public.appointments
  WHERE id = _appointment_id AND client_whatsapp = _client_whatsapp AND status = 'confirmed' AND start_at > now();
  
  IF _appt IS NULL THEN
    RETURN jsonb_build_object('error', 'Agendamento não encontrado ou não pode ser cancelado.');
  END IF;

  UPDATE public.appointments SET status = 'cancelled' WHERE id = _appointment_id;

  SELECT * INTO _shop FROM public.shops WHERE id = _appt.shop_id;
  SELECT * INTO _barber FROM public.barbers WHERE id = _appt.barber_id;
  SELECT * INTO _service FROM public.services WHERE id = _appt.service_id;

  RETURN jsonb_build_object(
    'success', true,
    'shop_whatsapp', _shop.phone_whatsapp,
    'barber_name', _barber.name,
    'service_name', _service.name,
    'client_name', _appt.client_name,
    'start_at', _appt.start_at
  );
END;
$$;
