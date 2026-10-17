CREATE OR REPLACE VIEW public.appointment_filter_records
WITH (security_invoker = true)
AS
SELECT
    appointments.id,
    appointments.starts_at,
    (appointments.starts_at AT TIME ZONE 'America/Los_Angeles')::DATE AS appointment_date,
    appointments.status,
    appointments.notes,
    appointments.quoted_price_cents,
    profiles.last_name,
    profiles.first_name,
    profiles.email,
    profiles.phone,
    services.name AS service_name,
    concat_ws(
        ' ',
        vehicles.year::TEXT,
        vehicles.make,
        vehicles.model
    ) AS vehicle,
    count(*) FILTER (WHERE appointments.status = 'completed')
        OVER (PARTITION BY appointments.customer_id) AS completed_job_count
FROM public.appointments AS appointments
JOIN public.profiles AS profiles
    ON profiles.id = appointments.customer_id
LEFT JOIN public.vehicles AS vehicles
    ON vehicles.id = appointments.vehicle_id
    AND vehicles.customer_id = appointments.customer_id
LEFT JOIN public.services AS services
    ON services.id = appointments.service_id;

REVOKE ALL ON public.appointment_filter_records FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.appointment_filter_records TO authenticated;
