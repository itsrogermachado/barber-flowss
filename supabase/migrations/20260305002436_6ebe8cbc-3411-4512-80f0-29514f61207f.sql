
-- Fix permissive shops insert policy - only allow if user has no shops yet (first shop) or is creating via RPC
DROP POLICY "Authenticated can insert shops" ON public.shops;

-- Create a function for shop creation during signup (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_shop_for_user(_user_id uuid, _shop_name text, _slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _shop_id uuid;
BEGIN
  INSERT INTO public.shops (name, slug, trial_ends_at)
  VALUES (_shop_name, _slug, now() + interval '14 days')
  RETURNING id INTO _shop_id;

  INSERT INTO public.memberships (user_id, shop_id, role)
  VALUES (_user_id, _shop_id, 'OWNER');

  RETURN _shop_id;
END;
$$;

-- create_appointment RPC (transactional, avoids race conditions)
CREATE OR REPLACE FUNCTION public.create_appointment(
  _shop_slug text,
  _service_id uuid,
  _barber_choice text,  -- barber uuid or 'any'
  _start_at timestamptz,
  _client_name text,
  _client_whatsapp text,
  _notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  _plan_limit record;
  _month_count int;
BEGIN
  -- Get shop
  SELECT * INTO _shop FROM public.shops WHERE slug = _shop_slug AND is_published = true;
  IF _shop IS NULL THEN
    RETURN jsonb_build_object('error', 'Barbearia não encontrada ou indisponível.');
  END IF;

  -- Get service
  SELECT * INTO _service FROM public.services WHERE id = _service_id AND shop_id = _shop.id AND is_active = true;
  IF _service IS NULL THEN
    RETURN jsonb_build_object('error', 'Serviço não encontrado.');
  END IF;

  -- Calculate end_at
  _end_at := _start_at + (_service.duration_minutes * interval '1 minute');

  -- Determine barber
  IF _barber_choice = 'any' THEN
    -- Find available barber with lowest sort_order
    SELECT b.id INTO _barber_id
    FROM public.barbers b
    WHERE b.shop_id = _shop.id AND b.is_active = true
      -- Has working hours for this day
      AND EXISTS (
        SELECT 1 FROM public.working_hours wh
        WHERE wh.shop_id = _shop.id AND wh.barber_id = b.id AND wh.is_enabled = true
          AND wh.weekday = EXTRACT(DOW FROM _start_at AT TIME ZONE _shop.timezone)::int
          AND wh.start_time <= to_char(_start_at AT TIME ZONE _shop.timezone, 'HH24:MI')
          AND wh.end_time >= to_char(_end_at AT TIME ZONE _shop.timezone, 'HH24:MI')
      )
      -- No appointment conflicts
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.shop_id = _shop.id AND a.barber_id = b.id
          AND a.status IN ('confirmed', 'completed')
          AND a.start_at < _end_at AND a.end_at > _start_at
      )
      -- No blocked slot conflicts
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
    -- Verify barber exists and is active
    IF NOT EXISTS (SELECT 1 FROM public.barbers WHERE id = _barber_id AND shop_id = _shop.id AND is_active = true) THEN
      RETURN jsonb_build_object('error', 'Barbeiro não encontrado.');
    END IF;
  END IF;

  -- Check working hours
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

  -- Check break time
  IF _wh.break_start_time IS NOT NULL AND _wh.break_end_time IS NOT NULL THEN
    IF _start_time_local < _wh.break_end_time AND _end_time_local > _wh.break_start_time THEN
      RETURN jsonb_build_object('error', 'Horário conflita com o intervalo do barbeiro.');
    END IF;
  END IF;

  -- Check appointment conflicts
  SELECT COUNT(*) INTO _conflict_count FROM public.appointments
  WHERE shop_id = _shop.id AND barber_id = _barber_id
    AND status IN ('confirmed', 'completed')
    AND start_at < _end_at AND end_at > _start_at;

  IF _conflict_count > 0 THEN
    RETURN jsonb_build_object('error', 'Esse horário já foi ocupado. Escolha outro.');
  END IF;

  -- Check blocked slots
  SELECT COUNT(*) INTO _blocked_count FROM public.blocked_slots
  WHERE shop_id = _shop.id AND barber_id = _barber_id
    AND start_at < _end_at AND end_at > _start_at;

  IF _blocked_count > 0 THEN
    RETURN jsonb_build_object('error', 'Esse horário está bloqueado. Escolha outro.');
  END IF;

  -- Check plan limits
  SELECT * INTO _plan_limit FROM public.plan_limits WHERE plan = _shop.plan;
  IF _plan_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO _month_count FROM public.appointments
    WHERE shop_id = _shop.id
      AND start_at >= date_trunc('month', now())
      AND status IN ('confirmed', 'completed');
    IF _month_count >= _plan_limit.max_appointments_month THEN
      RETURN jsonb_build_object('error', 'Limite de agendamentos do plano atingido.');
    END IF;
  END IF;

  -- Insert appointment
  INSERT INTO public.appointments (shop_id, barber_id, service_id, client_name, client_whatsapp, notes, start_at, end_at, status)
  VALUES (_shop.id, _barber_id, _service_id, _client_name, _client_whatsapp, _notes, _start_at, _end_at, 'confirmed')
  RETURNING id INTO _appointment_id;

  RETURN jsonb_build_object('appointment_id', _appointment_id, 'barber_id', _barber_id);
END;
$$;

-- Grant anon access to create_appointment (public booking)
GRANT EXECUTE ON FUNCTION public.create_appointment TO anon;
GRANT EXECUTE ON FUNCTION public.create_appointment TO authenticated;

-- get_available_slots RPC for public booking
CREATE OR REPLACE FUNCTION public.get_available_slots(
  _shop_slug text,
  _service_id uuid,
  _barber_id uuid,  -- NULL for any
  _date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _shop record;
  _service record;
  _slots jsonb := '[]'::jsonb;
  _barber record;
  _wh record;
  _weekday int;
  _slot_time timestamptz;
  _slot_end timestamptz;
  _slot_str text;
  _interval_min int;
  _tz text;
  _start_hour int;
  _start_min int;
  _end_hour int;
  _end_min int;
  _current_hour int;
  _current_min int;
BEGIN
  SELECT * INTO _shop FROM public.shops WHERE slug = _shop_slug AND is_published = true;
  IF _shop IS NULL THEN RETURN '[]'::jsonb; END IF;

  SELECT * INTO _service FROM public.services WHERE id = _service_id AND shop_id = _shop.id AND is_active = true;
  IF _service IS NULL THEN RETURN '[]'::jsonb; END IF;

  _tz := _shop.timezone;
  _interval_min := _shop.slot_interval_minutes;
  _weekday := EXTRACT(DOW FROM _date)::int;

  FOR _barber IN
    SELECT b.* FROM public.barbers b
    WHERE b.shop_id = _shop.id AND b.is_active = true
      AND (_barber_id IS NULL OR b.id = _barber_id)
    ORDER BY b.sort_order
  LOOP
    SELECT * INTO _wh FROM public.working_hours
    WHERE shop_id = _shop.id AND barber_id = _barber.id AND weekday = _weekday AND is_enabled = true
    LIMIT 1;

    IF _wh IS NOT NULL THEN
      _start_hour := split_part(_wh.start_time, ':', 1)::int;
      _start_min := split_part(_wh.start_time, ':', 2)::int;
      _end_hour := split_part(_wh.end_time, ':', 1)::int;
      _end_min := split_part(_wh.end_time, ':', 2)::int;

      _current_hour := _start_hour;
      _current_min := _start_min;

      WHILE (_current_hour * 60 + _current_min + _service.duration_minutes) <= (_end_hour * 60 + _end_min) LOOP
        _slot_str := lpad(_current_hour::text, 2, '0') || ':' || lpad(_current_min::text, 2, '0');
        _slot_time := (_date::text || ' ' || _slot_str)::timestamp AT TIME ZONE _tz;
        _slot_end := _slot_time + (_service.duration_minutes * interval '1 minute');

        -- Skip if in the past
        IF _slot_time > now() THEN
          -- Check break
          IF _wh.break_start_time IS NULL OR _wh.break_end_time IS NULL
             OR NOT (_slot_str < _wh.break_end_time AND lpad(((_current_hour * 60 + _current_min + _service.duration_minutes) / 60)::text, 2, '0') || ':' || lpad(((_current_hour * 60 + _current_min + _service.duration_minutes) % 60)::text, 2, '0') > _wh.break_start_time) THEN
            -- Check conflicts
            IF NOT EXISTS (
              SELECT 1 FROM public.appointments a
              WHERE a.shop_id = _shop.id AND a.barber_id = _barber.id
                AND a.status IN ('confirmed', 'completed')
                AND a.start_at < _slot_end AND a.end_at > _slot_time
            ) AND NOT EXISTS (
              SELECT 1 FROM public.blocked_slots bs
              WHERE bs.shop_id = _shop.id AND bs.barber_id = _barber.id
                AND bs.start_at < _slot_end AND bs.end_at > _slot_time
            ) THEN
              _slots := _slots || jsonb_build_object('time', _slot_str, 'barber_id', _barber.id, 'barber_name', _barber.name, 'start_at', _slot_time);
            END IF;
          END IF;
        END IF;

        _current_min := _current_min + _interval_min;
        IF _current_min >= 60 THEN
          _current_hour := _current_hour + (_current_min / 60);
          _current_min := _current_min % 60;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RETURN _slots;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_slots TO anon;
GRANT EXECUTE ON FUNCTION public.get_available_slots TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_shop_for_user TO authenticated;
