-- GP-64 integration checks. Run ONLY against a clean, disposable local Supabase
-- database after all migrations, with a database owner connection:
-- psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/admin-dashboard.sql
-- Every fixture is rolled back. This is not a production migration.
BEGIN;

INSERT INTO auth.users (id, email) VALUES
    ('64000000-0000-0000-0000-000000000001', 'admin@gp64.example.invalid'),
    ('64000000-0000-0000-0000-000000000002', 'customer@gp64.example.invalid');
UPDATE public.profiles SET role = 'admin'
WHERE id = '64000000-0000-0000-0000-000000000001';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '64000000-0000-0000-0000-000000000001';
DO $$
DECLARE v_summary JSONB := public.get_admin_dashboard_summary();
BEGIN
    ASSERT v_summary->'todayAppointments' = '[]'::JSONB, 'Empty appointments';
    ASSERT v_summary->'lowestStock' = '[]'::JSONB, 'Empty inventory';
    ASSERT v_summary->'popularService' = 'null'::JSONB, 'No popular service yet';
    ASSERT (v_summary->>'customerCount')::INTEGER = 1, 'Admin excluded from customers';
END;
$$;
RESET ROLE;

INSERT INTO public.vehicles (id, customer_id, make, model, year, license_plate)
VALUES ('64000000-0000-0000-0000-000000000003',
    '64000000-0000-0000-0000-000000000002', 'Test', 'Vehicle', 2026, 'GP64TEST');

INSERT INTO public.services (id, name, duration_minutes, price_cents, active) VALUES
    ('64000000-0000-0000-0000-000000000004', 'GP64 Alpha', 15, 1000, TRUE),
    ('64000000-0000-0000-0000-000000000005', 'GP64 Beta', 15, 1000, TRUE),
    ('64000000-0000-0000-0000-000000000006', 'GP64 Inactive', 15, 1000, FALSE);

INSERT INTO public.inventory (name, quantity) VALUES
    ('GP64 Empty Item', 0), ('GP64 Sensor', 3), ('GP64 Valve', 17);

WITH samples (day_offset, hour_offset, status, service_id) AS (
    VALUES
        (0, 1, 'confirmed', '64000000-0000-0000-0000-000000000004'::UUID),
        (0, 4, 'completed', '64000000-0000-0000-0000-000000000005'::UUID),
        (0, 5, 'completed', '64000000-0000-0000-0000-000000000005'::UUID),
        (0, 10, 'pending', '64000000-0000-0000-0000-000000000004'::UUID),
        (0, 11, 'cancelled', '64000000-0000-0000-0000-000000000004'::UUID),
        (0, 12, 'denied', '64000000-0000-0000-0000-000000000004'::UUID),
        (-1, 23, 'confirmed', '64000000-0000-0000-0000-000000000004'::UUID),
        (1, 0, 'confirmed', '64000000-0000-0000-0000-000000000004'::UUID)
), times AS (
    SELECT *, (((CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')::DATE
        + day_offset)::TIMESTAMP + make_interval(hours => hour_offset))
        AT TIME ZONE 'America/Los_Angeles' AS starts_at
    FROM samples
)
INSERT INTO public.appointments (customer_id, vehicle_id, service_id, starts_at, ends_at, status)
SELECT '64000000-0000-0000-0000-000000000002',
    '64000000-0000-0000-0000-000000000003', service_id,
    starts_at, starts_at + INTERVAL '15 minutes', status
FROM times;

-- More profiles than the usual REST row cap; the RPC must still count all rows.
INSERT INTO auth.users (id, email)
SELECT gen_random_uuid(), 'customer-' || n || '@gp64.example.invalid'
FROM generate_series(1, 1001) AS n;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '64000000-0000-0000-0000-000000000001';
DO $$
DECLARE v_summary JSONB := public.get_admin_dashboard_summary();
BEGIN
    ASSERT (v_summary->>'todayCount')::INTEGER = 3, 'Today excludes pending, denied, cancelled and adjacent days';
    ASSERT jsonb_array_length(v_summary->'todayAppointments') = 2, 'Bounded appointment preview';
    ASSERT v_summary#>>'{todayAppointments,0,serviceName}' = 'GP64 Alpha', 'Earliest appointment first';
    ASSERT (v_summary->>'pendingCount')::INTEGER = 1, 'Pending request count';
    ASSERT (v_summary->>'customerCount')::INTEGER = 1002, 'Counts exceed REST row cap';
    ASSERT (v_summary->>'vehicleCount')::INTEGER = 1, 'Registered vehicles';
    ASSERT (v_summary->>'activeServiceCount')::INTEGER = 2, 'Inactive service excluded';
    ASSERT v_summary->>'popularService' = 'GP64 Beta', 'Popularity uses completed jobs';
    ASSERT jsonb_array_length(v_summary->'lowestStock') = 2, 'Bounded stock preview';
    ASSERT v_summary#>>'{lowestStock,0,quantity}' = '0', 'Zero stock included first';
    ASSERT v_summary#>>'{lowestStock,1,quantity}' = '3', 'Next-lowest stock';
END;
$$;

SET LOCAL request.jwt.claim.sub = '64000000-0000-0000-0000-000000000002';
DO $$
BEGIN
    ASSERT (SELECT count(*) FROM public.inventory) = 0, 'Customer inventory RLS';
    BEGIN
        PERFORM public.get_admin_dashboard_summary();
        RAISE EXCEPTION 'Customer unexpectedly accessed admin summary';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO public.inventory (name, quantity) VALUES ('Unauthorized', 1);
        RAISE EXCEPTION 'Customer unexpectedly inserted inventory';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
RESET ROLE;

DO $$
BEGIN
    ASSERT NOT has_function_privilege('anon', 'public.get_admin_dashboard_summary()', 'EXECUTE'), 'No guest RPC grant';
    ASSERT NOT has_table_privilege('anon', 'public.inventory', 'SELECT'), 'No guest inventory grant';
    ASSERT NOT has_table_privilege('authenticated', 'public.inventory', 'INSERT'), 'Read-only frontend inventory';
    ASSERT EXTRACT(EPOCH FROM (
        (TIMESTAMP '2026-03-09' AT TIME ZONE 'America/Los_Angeles')
        - (TIMESTAMP '2026-03-08' AT TIME ZONE 'America/Los_Angeles')
    )) / 3600 = 23, 'Spring local day is 23 hours';
    ASSERT EXTRACT(EPOCH FROM (
        (TIMESTAMP '2026-11-02' AT TIME ZONE 'America/Los_Angeles')
        - (TIMESTAMP '2026-11-01' AT TIME ZONE 'America/Los_Angeles')
    )) / 3600 = 25, 'Fall local day is 25 hours';
END;
$$;

ROLLBACK;
