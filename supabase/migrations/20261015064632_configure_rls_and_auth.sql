
-- GloPortal: Authentication and RLS policies


-- 1. PRIVATE ADMIN ROLE CHECK


CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION private.is_admin()
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.is_admin()
TO authenticated;



-- 2. AUTOMATIC PROFILE CREATION


-- When Supabase Auth creates a user,
-- automatically create their customer profile.

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        phone
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        NEW.email,
        NEW.raw_user_meta_data ->> 'phone'
    );

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_user()
FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_gloportal_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.handle_new_user();


-- 3. PROFILES


GRANT SELECT ON public.profiles TO authenticated;

-- Customers can edit their basic details,
-- but not their role, ID, or authentication email.

GRANT UPDATE (first_name, last_name, phone)
ON public.profiles TO authenticated;

CREATE POLICY profiles_read
ON public.profiles
FOR SELECT TO authenticated
USING (
    id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);

CREATE POLICY profiles_update
ON public.profiles
FOR UPDATE TO authenticated
USING (
    id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
)
WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);


-- 4. VEHICLES

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.vehicles TO authenticated;

CREATE POLICY vehicles_read
ON public.vehicles
FOR SELECT TO authenticated
USING (
    customer_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);

CREATE POLICY vehicles_insert
ON public.vehicles
FOR INSERT TO authenticated
WITH CHECK (
    customer_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);

CREATE POLICY vehicles_update
ON public.vehicles
FOR UPDATE TO authenticated
USING (
    customer_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
)
WITH CHECK (
    customer_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);

CREATE POLICY vehicles_delete
ON public.vehicles
FOR DELETE TO authenticated
USING (
    customer_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);


-- 5. SERVICES


GRANT SELECT ON public.services
TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE
ON public.services TO authenticated;

-- Everyone can see active services.

CREATE POLICY services_public_read
ON public.services
FOR SELECT TO anon, authenticated
USING (active = TRUE);

-- Admins can see inactive services.

CREATE POLICY services_admin_read
ON public.services
FOR SELECT TO authenticated
USING ((SELECT private.is_admin()));

CREATE POLICY services_admin_insert
ON public.services
FOR INSERT TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY services_admin_update
ON public.services
FOR UPDATE TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY services_admin_delete
ON public.services
FOR DELETE TO authenticated
USING ((SELECT private.is_admin()));


-- 6. AVAILABILITY WINDOWS


GRANT SELECT ON public.availability_windows
TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE
ON public.availability_windows TO authenticated;

-- Public availability is visible to everyone.

CREATE POLICY availability_public_read
ON public.availability_windows
FOR SELECT TO anon, authenticated
USING (TRUE);

-- Only admins manage available windows.

CREATE POLICY availability_admin_insert
ON public.availability_windows
FOR INSERT TO authenticated
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY availability_admin_update
ON public.availability_windows
FOR UPDATE TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY availability_admin_delete
ON public.availability_windows
FOR DELETE TO authenticated
USING ((SELECT private.is_admin()));



-- 7. APPOINTMENTS: READ ACCESS ONLY

GRANT SELECT ON public.appointments
TO authenticated;

CREATE POLICY appointments_read
ON public.appointments
FOR SELECT TO authenticated
USING (
    customer_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);

