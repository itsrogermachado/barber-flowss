CREATE OR REPLACE FUNCTION public.get_client_appointments(_shop_slug text, _client_whatsapp text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ORDER BY a.start_at DESC
  ) t;

  RETURN _results;
END;
$function$;