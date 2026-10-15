
-- GloPortal: Booking constraints and availability.
-- Prototype assumption: one appointment at a time.
-- Business timezone: America/Los_Angeles.

-- 1. PREVENT OVERLAPPING APPOINTMENTS


ALTER TABLE public.appointments
ADD CONSTRAINT appointments_no_active_overlap
EXCLUDE USING gist (
    tstzrange(starts_at, ends_at, '[)') WITH &&
)
WHERE (
    status IN ('pending', 'confirmed', 'completed')
);


-- 2. ALIGN AVAILABILITY WINDOW STARTS
-- Require windows to start on 15-minute marks.

ALTER TABLE public.availability_windows
ADD CONSTRAINT availability_quarter_hour_start
CHECK (
    starts_at = date_bin(
        INTERVAL '15 minutes',
        starts_at,
        TIMESTAMPTZ '2000-01-01 00:00:00+00'
    )
);

-- 3. PRIVATE AVAILABILITY CALCULATION


-- This helper can inspect appointments but
-- never returns customer information.

CREATE FUNCTION private.calculate_availability(
    p_date DATE,
    p_service_id UUID
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    is_available BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_duration INTEGER;
    v_day_start TIMESTAMPTZ;
    v_day_end TIMESTAMPTZ;
BEGIN
    IF p_date IS NULL OR p_service_id IS NULL THEN
        RETURN;
    END IF;

    -- Find the requested service duration.
    SELECT s.duration_minutes
    INTO v_duration
    FROM public.services AS s
    WHERE s.id = p_service_id
      AND s.active = TRUE;

    IF v_duration IS NULL THEN
        RETURN;
    END IF;

    -- Convert the selected California date
    -- into timezone-aware day boundaries.
    v_day_start :=
        p_date::timestamp
        AT TIME ZONE 'America/Los_Angeles';

    v_day_end :=
        (p_date + 1)::timestamp
        AT TIME ZONE 'America/Los_Angeles';

    RETURN QUERY
    WITH possible_slots AS (
        SELECT DISTINCT g.start_time
        FROM public.availability_windows AS w

        CROSS JOIN LATERAL generate_series(
            w.starts_at,
            w.ends_at
                - v_duration * INTERVAL '1 minute',
            INTERVAL '15 minutes'
        ) AS g(start_time)

        WHERE w.starts_at < v_day_end
          AND w.ends_at > v_day_start
          AND g.start_time >= v_day_start
          AND g.start_time < v_day_end
    )
    SELECT
        ps.start_time,
        ps.start_time
            + v_duration * INTERVAL '1 minute',

        (
            ps.start_time > NOW()

            AND NOT EXISTS (
                SELECT 1
                FROM public.appointments AS a
                WHERE a.status IN (
                    'pending',
                    'confirmed',
                    'completed'
                )
                AND tstzrange(
                    a.starts_at,
                    a.ends_at,
                    '[)'
                ) && tstzrange(
                    ps.start_time,
                    ps.start_time
                        + v_duration * INTERVAL '1 minute',
                    '[)'
                )
            )
        ) AS is_available

    FROM possible_slots AS ps
    ORDER BY ps.start_time;
END;
$$;

-- Restrict privileged helper execution.
REVOKE ALL ON FUNCTION
    private.calculate_availability(DATE, UUID)
FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA private
TO anon, authenticated;

GRANT EXECUTE ON FUNCTION
    private.calculate_availability(DATE, UUID)
TO anon, authenticated;

-- 4. PUBLIC API FUNCTION


-- Safe wrapper callable from React.
-- Runs with the caller's privileges and
-- invokes the narrowly scoped helper.

CREATE FUNCTION public.get_available_times(
    p_date DATE,
    p_service_id UUID
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    is_available BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT *
    FROM private.calculate_availability(
        p_date,
        p_service_id
    );
$$;

REVOKE ALL ON FUNCTION
    public.get_available_times(DATE, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.get_available_times(DATE, UUID)
TO anon, authenticated;












