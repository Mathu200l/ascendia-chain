CREATE OR REPLACE FUNCTION public.set_invoice_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.client_id IS NOT NULL THEN
    SELECT cp.user_id INTO NEW.user_id
    FROM public.client_profiles cp
    WHERE cp.id = NEW.client_id;
  END IF;

  IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL AND NOT public.is_staff(auth.uid()) THEN
    NEW.user_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_invoice_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_invoice_user_id() FROM anon;
REVOKE ALL ON FUNCTION public.set_invoice_user_id() FROM authenticated;