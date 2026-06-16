ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

CREATE OR REPLACE FUNCTION public.set_invoice_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

DROP TRIGGER IF EXISTS trg_set_invoice_user_id ON public.invoices;
CREATE TRIGGER trg_set_invoice_user_id
BEFORE INSERT OR UPDATE OF client_id, user_id ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.set_invoice_user_id();

DROP POLICY IF EXISTS profiles_select_authed ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_select_own_or_staff
ON public.profiles
FOR SELECT
TO authenticated
USING ((id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS client_profiles_select_own_or_staff ON public.client_profiles;
DROP POLICY IF EXISTS client_profiles_update_own_or_admin ON public.client_profiles;
DROP POLICY IF EXISTS client_profiles_delete_admin ON public.client_profiles;
CREATE POLICY client_profiles_select_own_or_staff
ON public.client_profiles
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY client_profiles_update_own_or_staff
ON public.client_profiles
FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR public.is_staff(auth.uid()))
WITH CHECK ((user_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY client_profiles_delete_staff
ON public.client_profiles
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS invoices_read_authed ON public.invoices;
DROP POLICY IF EXISTS invoices_staff_insert ON public.invoices;
DROP POLICY IF EXISTS invoices_staff_update ON public.invoices;
DROP POLICY IF EXISTS invoices_admin_delete ON public.invoices;
CREATE POLICY invoices_select_own_or_staff
ON public.invoices
FOR SELECT
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.client_profiles cp
    WHERE cp.id = invoices.client_id
      AND cp.user_id = auth.uid()
  )
);
CREATE POLICY invoices_insert_staff_or_own
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY invoices_update_staff_or_own
ON public.invoices
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid())
WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY invoices_delete_staff
ON public.invoices
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS invoice_items_read_authed ON public.invoice_items;
DROP POLICY IF EXISTS invoice_items_staff_insert ON public.invoice_items;
DROP POLICY IF EXISTS invoice_items_staff_update ON public.invoice_items;
DROP POLICY IF EXISTS invoice_items_admin_delete ON public.invoice_items;
CREATE POLICY invoice_items_select_own_or_staff
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices inv
    WHERE inv.id = invoice_items.invoice_id
      AND (public.is_staff(auth.uid()) OR inv.user_id = auth.uid())
  )
);
CREATE POLICY invoice_items_insert_staff
ON public.invoice_items
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY invoice_items_update_staff
ON public.invoice_items
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY invoice_items_delete_staff
ON public.invoice_items
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS shipments_read_authed ON public.shipments;
DROP POLICY IF EXISTS shipments_staff_insert ON public.shipments;
DROP POLICY IF EXISTS shipments_staff_update ON public.shipments;
DROP POLICY IF EXISTS shipments_admin_delete ON public.shipments;
CREATE POLICY shipments_select_own_or_staff
ON public.shipments
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY shipments_insert_staff_or_own
ON public.shipments
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY shipments_update_staff_or_own
ON public.shipments
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid())
WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY shipments_delete_staff
ON public.shipments
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS support_tickets_read_authed ON public.support_tickets;
DROP POLICY IF EXISTS support_tickets_staff_insert ON public.support_tickets;
DROP POLICY IF EXISTS support_tickets_staff_update ON public.support_tickets;
DROP POLICY IF EXISTS support_tickets_admin_delete ON public.support_tickets;
CREATE POLICY support_tickets_select_own_or_staff
ON public.support_tickets
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY support_tickets_insert_staff_or_own
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY support_tickets_update_staff_or_own
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid())
WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
CREATE POLICY support_tickets_delete_staff
ON public.support_tickets
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));