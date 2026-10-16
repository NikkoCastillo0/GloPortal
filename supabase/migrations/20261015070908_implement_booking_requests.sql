
-- GloPortal: Booking requests and admin review
-- Booking capacity: one at a time (temporary assumption)
-- Appointment increments: 15 minutes


-- 1. REQUEST AN APPOINTMENT


CREATE FUNCTION private.request_appointment(
    p_vehicle_id UUID,
    p_service_id UUID,
    p_starts_at TIMESTAMPTZ,
    p_notes TEXT
)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_customer_id UUID;
    v_duration INTEGER;
    v_price INTEGER;
    v_ends_at TIMESTAMPTZ;
    v_appointment_id UUID;
BEGIN
    -- Identify the signed-in customer.
    v_customer_id := auth.uid();

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_vehicle_id IS NULL
       OR p_service_id IS NULL
       OR p_starts_at IS NULL THEN
        RAISE EXCEPTION 'Missing booking information';
    END IF;

    -- Make sure the customer owns the vehicle.
    IF NOT EXISTS (
        SELECT 1
        FROM public.vehicles
        WHERE id = p_vehicle_id
          AND customer_id = v_customer_id
    ) THEN
        RAISE EXCEPTION 'Vehicle not found for customer';
    END IF;

    -- Retrieve the real service duration and price.
    SELECT duration_minutes, price_cents
    INTO v_duration, v_price
    FROM public.services
    WHERE id = p_service_id
      AND active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not available';
    END IF;

    -- Do not allow appointments in the past.
    IF p_starts_at <= NOW() THEN
        RAISE EXCEPTION 'Appointment must be in the future';
    END IF;

    -- Require 15-minute start time alignment.
    IF p_starts_at <> date_bin(
        INTERVAL '15 minutes',
        p_starts_at,
        TIMESTAMPTZ '2000-01-01 00:00:00+00'
    ) THEN
        RAISE EXCEPTION 'Use 15-minute time increments';
    END IF;

    -- Calculate end time from the service duration.
    v_ends_at :=
        p_starts_at + v_duration * INTERVAL '1 minute';

    -- Verify the entire appointment fits
    -- inside an administrator-defined window.
    IF NOT EXISTS (
        SELECT 1
        FROM public.availability_windows
        WHERE starts_at <= p_starts_at
          AND ends_at >= v_ends_at
    ) THEN
        RAISE EXCEPTION 'Outside available booking hours';
    END IF;

    -- Optional notes have a maximum length.
    IF LENGTH(COALESCE(p_notes, '')) > 2000 THEN
        RAISE EXCEPTION 'Appointment notes are too long';
    END IF;

    -- Check existing pending/confirmed bookings.
    IF EXISTS (
        SELECT 1
        FROM public.appointments AS a
        WHERE a.status IN (
            'pending', 'confirmed', 'completed'
        )
        AND tstzrange(
            a.starts_at, a.ends_at, '[)'
        ) && tstzrange(
            p_starts_at, v_ends_at, '[)'
        )
    ) THEN
        RAISE EXCEPTION 'Requested time is unavailable';
    END IF;

    -- The existing exclusion constraint provides
    -- final protection against concurrent bookings.
    INSERT INTO public.appointments (
        customer_id,
        vehicle_id,
        service_id,
        starts_at,
        ends_at,
        status,
        notes,
        quoted_price_cents
    )
    VALUES (
        v_customer_id,
        p_vehicle_id,
        p_service_id,
        p_starts_at,
        v_ends_at,
        'pending',
        p_notes,
        v_price
    )
    RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$;

REVOKE ALL ON FUNCTION private.request_appointment(
    UUID, UUID, TIMESTAMPTZ, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION private.request_appointment(
    UUID, UUID, TIMESTAMPTZ, TEXT
) TO authenticated;


-- 2. ADMINISTRATOR APPROVAL / DENIAL


CREATE FUNCTION private.review_appointment(
    p_appointment_id UUID,
    p_approve BOOLEAN
)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_starts_at TIMESTAMPTZ;
    v_ends_at TIMESTAMPTZ;
    v_status TEXT;
BEGIN
    -- Only trusted administrators can review.
    IF NOT COALESCE(private.is_admin(), FALSE) THEN
        RAISE EXCEPTION 'Administrator access required';
    END IF;

    IF p_appointment_id IS NULL
       OR p_approve IS NULL THEN
        RAISE EXCEPTION 'Missing review information';
    END IF;

    -- Lock the appointment during review.
    SELECT a.starts_at, a.ends_at
    INTO v_starts_at, v_ends_at
    FROM public.appointments AS a
    WHERE a.id = p_appointment_id
      AND a.status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending appointment not found';
    END IF;

    IF p_approve THEN
        IF v_starts_at <= NOW() THEN
            RAISE EXCEPTION 'Cannot approve a past appointment';
        END IF;

        -- Recheck availability in case the
        -- administrator modified shop hours.
        IF NOT EXISTS (
            SELECT 1
            FROM public.availability_windows
            WHERE starts_at <= v_starts_at
              AND ends_at >= v_ends_at
        ) THEN
            RAISE EXCEPTION 'Booking window no longer exists';
        END IF;
    END IF;

    UPDATE public.appointments
    SET status = CASE
        WHEN p_approve THEN 'confirmed'
        ELSE 'denied'
    END
    WHERE id = p_appointment_id
      AND status = 'pending'
    RETURNING status INTO v_status;

    RETURN v_status;
END;
$$;

REVOKE ALL ON FUNCTION private.review_appointment(
    UUID, BOOLEAN
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION private.review_appointment(
    UUID, BOOLEAN
) TO authenticated;


-- 3. PUBLIC API WRAPPERS


-- React calls this to request an appointment.

CREATE FUNCTION public.request_appointment(
    p_vehicle_id UUID,
    p_service_id UUID,
    p_starts_at TIMESTAMPTZ,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT private.request_appointment(
        p_vehicle_id,
        p_service_id,
        p_starts_at,
        p_notes
    );
$$;

REVOKE ALL ON FUNCTION public.request_appointment(
    UUID, UUID, TIMESTAMPTZ, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.request_appointment(
    UUID, UUID, TIMESTAMPTZ, TEXT
) TO authenticated;


-- React's admin portal will  calls this.

CREATE FUNCTION public.review_appointment(
    p_appointment_id UUID,
    p_approve BOOLEAN
)
RETURNS TEXT
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT private.review_appointment(
        p_appointment_id,
        p_approve
    );
$$;

REVOKE ALL ON FUNCTION public.review_appointment(
    UUID, BOOLEAN
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.review_appointment(
    UUID, BOOLEAN
) TO authenticated;
