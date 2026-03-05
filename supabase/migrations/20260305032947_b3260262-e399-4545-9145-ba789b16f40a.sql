
CREATE OR REPLACE FUNCTION public.create_appointment(_shop_slug text, _service_id uuid, _barber_choice text, _start_at timestamp with time zone, _client_name text, _client_whatsapp text, _notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _shop record;
  _service record;
  _barber_id uuid;
  _end_at timestamptz;
  _weekday int;
  _start_time_local text;
  _end_time_local text;
  _wh record;
  _conflict_count int;
  _blocked_count int;
  _appointment_id uuid;
BEGIN
  SELECT * INTO _shop FROM public.shops WHERE slug = _shop_slug AND is_published = true;
  IF _shop IS NULL THEN
    RETURN jsonb_build_object('error', 'Barbearia não encontrada ou indisponível.');
  END IF;

  SELECT * INTO _service FROM public.services WHERE id = _service_id AND shop_id = _shop.id AND is_active = true;
  IF _service IS NULL THEN
    RETURN jsonb_build_object('error', 'Serviço não encontrado.');
  END IF;

  _end_at := _start_at + (_service.duration_minutes * interval '1 minute');

  IF _barber_choice = 'any' THEN
    SELECT b.id INTO _barber_id
    FROM public.barbers b
    WHERE b.shop_id = _shop.id AND b.is_active = true
      AND EXISTS (
        SELECT 1 FROM public.working_hours wh
        WHERE wh.shop_id = _shop.id AND wh.barber_id = b.id AND wh.is_enabled = true
          AND wh.weekday = EXTRACT(DOW FROM _start_at AT TIME ZONE _shop.timezone)::int
          AND wh.start_time <= to_char(_start_at AT TIME ZONE _shop.timezone, 'HH24:MI')
          AND wh.end_time >= to_char(_end_at AT TIME ZONE _shop.timezone, 'HH24:MI')
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.shop_id = _shop.id AND a.barber_id = b.id
          AND a.status IN ('confirmed', 'completed')
          AND a.start_at < _end_at AND a.end_at > _start_at
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.blocked_slots bs
        WHERE bs.shop_id = _shop.id AND bs.barber_id = b.id
          AND bs.start_at < _end_at AND bs.end_at > _start_at
      )
    ORDER BY b.sort_order ASC
    LIMIT 1;

    IF _barber_id IS NULL THEN
      RETURN jsonb_build_object('error', 'Nenhum barbeiro disponível nesse horário. Tente outro.');
    END IF;
  ELSE
    _barber_id := _barber_choice::uuid;
    IF NOT EXISTS (SELECT 1 FROM public.barbers WHERE id = _barber_id AND shop_id = _shop.id AND is_active = true) THEN
      RETURN jsonb_build_object('error', 'Barbeiro não encontrado.');
    END IF;
  END IF;

  _weekday := EXTRACT(DOW FROM _start_at AT TIME ZONE _shop.timezone)::int;
  _start_time_local := to_char(_start_at AT TIME ZONE _shop.timezone, 'HH24:MI');
  _end_time_local := to_char(_end_at AT TIME ZONE _shop.timezone, 'HH24:MI');

  SELECT * INTO _wh FROM public.working_hours
  WHERE shop_id = _shop.id AND barber_id = _barber_id AND weekday = _weekday AND is_enabled = true
  LIMIT 1;

  IF _wh IS NULL THEN
    RETURN jsonb_build_object('error', 'Barbeiro não trabalha nesse dia.');
  END IF;

  IF _start_time_local < _wh.start_time OR _end_time_local > _wh.end_time THEN
    RETURN jsonb_build_object('error', 'Horário fora do expediente do barbeiro.');
  END IF;

  IF _wh.break_start_time IS NOT NULL AND _wh.break_end_time IS NOT NULL THEN
    IF _start_time_local < _wh.break_end_time AND _end_time_local > _wh.break_start_time THEN
      RETURN jsonb_build_object('error', 'Horário conflita com o intervalo do barbeiro.');
    END IF;
  END IF;

  SELECT COUNT(*) INTO _conflict_count FROM public.appointments
  WHERE shop_id = _shop.id AND barber_id = _barber_id
    AND status IN ('confirmed', 'completed')
    AND start_at < _end_at AND end_at > _start_at;

  IF _conflict_count > 0 THEN
    RETURN jsonb_build_object('error', 'Esse horário já foi ocupado. Escolha outro.');
  END IF;

  SELECT COUNT(*) INTO _blocked_count FROM public.blocked_slots
  WHERE shop_id = _shop.id AND barber_id = _barber_id
    AND start_at < _end_at AND end_at > _start_at;

  IF _blocked_count > 0 THEN
    RETURN jsonb_build_object('error', 'Esse horário está bloqueado. Escolha outro.');
  END IF;

  INSERT INTO public.appointments (shop_id, barber_id, service_id, client_name, client_whatsapp, notes, start_at, end_at, status)
  VALUES (_shop.id, _barber_id, _service_id, _client_name, _client_whatsapp, _notes, _start_at, _end_at, 'confirmed')
  RETURNING id INTO _appointment_id;

  RETURN jsonb_build_object('appointment_id', _appointment_id, 'barber_id', _barber_id);
END;
$function$;

UPDATE public.plan_limits SET max_appointments_month = 999999;
