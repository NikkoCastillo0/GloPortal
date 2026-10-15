
-- GloPortal: Initial database schema
-- All timestamps use timestamptz (timezone-aware).
-- Application displays times in America/Los_Angeles.

-- 1. CUSTOMER PROFILES
-- Login credentials are handled separately by Supabase Auth.

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,

    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    email TEXT,
    phone TEXT,

    role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CUSTOMER VEHICLES

CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL
        REFERENCES public.profiles(id),

    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER CHECK (year BETWEEN 1886 AND 2100),
    license_plate TEXT NOT NULL,
    color TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Used to verify that appointments reference
    -- a vehicle belonging to the same customer.
    UNIQUE (id, customer_id)
);

-- 3. GARAGE GLO SERVICES

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL UNIQUE,
    description TEXT,

    duration_minutes INTEGER NOT NULL
        CHECK (duration_minutes > 0),

    price_cents INTEGER NOT NULL
        CHECK (price_cents >= 0),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADMINISTRATOR-DEFINED AVAILABILITY WINDOWS
-- Example: October 16, 9 AM to 5 PM.

CREATE TABLE public.availability_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (ends_at > starts_at)
);

-- 5. CUSTOMER APPOINTMENT REQUESTS

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL
        REFERENCES public.profiles(id),

    vehicle_id UUID NOT NULL,

    service_id UUID NOT NULL
        REFERENCES public.services(id),

    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'confirmed',
            'denied',
            'cancelled',
            'completed'
        )),

    notes TEXT,
    quoted_price_cents INTEGER
        CHECK (quoted_price_cents >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (ends_at > starts_at),

    FOREIGN KEY (vehicle_id, customer_id)
        REFERENCES public.vehicles(id, customer_id)
);

-- 6. INDEXES
-- Speed up common appointment and customer lookups.

CREATE INDEX idx_vehicles_customer
    ON public.vehicles(customer_id);

CREATE INDEX idx_appointments_customer
    ON public.appointments(customer_id);

CREATE INDEX idx_appointments_start_status
    ON public.appointments(starts_at, status);

CREATE INDEX idx_availability_start
    ON public.availability_windows(starts_at);

-- 7. SECURITY DEFAULTS


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    public.profiles,
    public.vehicles,
    public.services,
    public.availability_windows,
    public.appointments
FROM anon, authenticated;
