-- Keep the profile contact email aligned with the confirmed Auth identity.
-- The browser cannot write profiles.email; Auth owns that change.
CREATE OR REPLACE FUNCTION private.sync_confirmed_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.sync_confirmed_profile_email() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_gloportal_user_email_changed
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.sync_confirmed_profile_email();
