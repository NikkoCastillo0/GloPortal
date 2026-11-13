-- GP-64: Read-only shop overview. Inventory editing belongs to its own feature.
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (length(btrim(name)) > 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    last_restock DATE,
    supplier_url TEXT
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inventory FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.inventory TO authenticated;

CREATE POLICY inventory_admin_read
ON public.inventory
FOR SELECT TO authenticated
USING ((SELECT private.is_admin()));

CREATE INDEX idx_inventory_quantity_name ON public.inventory (quantity, name);

CREATE FUNCTION public.get_admin_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')::DATE;
    v_day_start TIMESTAMPTZ := v_today::TIMESTAMP AT TIME ZONE 'America/Los_Angeles';
    v_day_end TIMESTAMPTZ := (v_today + 1)::TIMESTAMP AT TIME ZONE 'America/Los_Angeles';
    v_summary JSONB;
BEGIN
    IF NOT COALESCE(private.is_admin(), FALSE) THEN
        RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
    END IF;

    WITH today_appointments AS (
        SELECT a.id, a.starts_at, s.name AS service_name
        FROM public.appointments a
        JOIN public.services s ON s.id = a.service_id
        WHERE a.status IN ('confirmed', 'completed')
          AND a.starts_at >= v_day_start
          AND a.starts_at < v_day_end
    ), appointment_preview AS (
        SELECT * FROM today_appointments ORDER BY starts_at, id LIMIT 2
    ), inventory_preview AS (
        SELECT id, name, quantity FROM public.inventory
        ORDER BY quantity, name, id LIMIT 2
    )
    SELECT jsonb_build_object(
        'todayCount', (SELECT count(*) FROM today_appointments),
        'todayAppointments', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', id, 'startsAt', starts_at, 'serviceName', service_name
            ) ORDER BY starts_at, id)
            FROM appointment_preview
        ), '[]'::JSONB),
        'customerCount', (SELECT count(*) FROM public.profiles WHERE role = 'customer'),
        'vehicleCount', (SELECT count(*) FROM public.vehicles),
        'lowestStock', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', id, 'name', name, 'quantity', quantity
            ) ORDER BY quantity, name, id)
            FROM inventory_preview
        ), '[]'::JSONB),
        'activeServiceCount', (SELECT count(*) FROM public.services WHERE active),
        'popularService', (
            SELECT s.name
            FROM public.appointments a
            JOIN public.services s ON s.id = a.service_id
            WHERE a.status = 'completed'
            GROUP BY s.id, s.name
            ORDER BY count(*) DESC, s.name, s.id
            LIMIT 1
        ),
        'pendingCount', (SELECT count(*) FROM public.appointments WHERE status = 'pending')
    ) INTO v_summary;

    RETURN v_summary;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_summary() TO authenticated;
