-- GP-18: Monthly availability indicators for the homepage calendar.
-- Read-only; respects the existing one-appointment-at-a-time booking rules.
-- A day is available if at least one active service has an unbooked start time.
-- Do not expose any customer or appointment information.

CREATE FUNCTION public.get_month_availability(p_month DATE)
RETURNS TABLE (
    available_date DATE,
    has_available_times BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT day_series.day::DATE AS available_date,
        EXISTS (
            SELECT 1
            FROM public.services AS s
            WHERE s.active = TRUE
              AND EXISTS (
                  SELECT 1
                  FROM private.calculate_availability(day_series.day::DATE, s.id) AS slot
                  WHERE slot.is_available = TRUE
              )
        ) AS has_available_times
    FROM generate_series(
        date_trunc('month', p_month::TIMESTAMP),
        date_trunc('month', p_month::TIMESTAMP) + INTERVAL '1 month - 1 day',
        INTERVAL '1 day'
    ) AS day_series(day);
$$;

REVOKE ALL ON FUNCTION public.get_month_availability(DATE)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_month_availability(DATE)
TO anon, authenticated;
