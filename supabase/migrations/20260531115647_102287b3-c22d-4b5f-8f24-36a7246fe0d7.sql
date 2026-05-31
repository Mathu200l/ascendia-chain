
-- =========================================================
-- BILLING & INVOICES (GST-compliant)
-- =========================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_gstin TEXT,
  client_address TEXT,
  seller_name TEXT NOT NULL DEFAULT 'NexusSCM Logistics Pvt Ltd',
  seller_gstin TEXT NOT NULL DEFAULT '29ABCDE1234F1Z5',
  seller_address TEXT NOT NULL DEFAULT 'Plot 42, Tech Park, Bengaluru, KA 560001',
  place_of_supply TEXT NOT NULL DEFAULT 'Karnataka',
  is_interstate BOOLEAN NOT NULL DEFAULT false,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  cgst NUMERIC(14,2) NOT NULL DEFAULT 0,
  sgst NUMERIC(14,2) NOT NULL DEFAULT 0,
  igst NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hsn_sac TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  line_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.invoice_items TO service_role;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoices_read_authed ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY invoices_staff_insert ON public.invoices FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY invoices_staff_update ON public.invoices FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY invoices_admin_delete ON public.invoices FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY invoice_items_read_authed ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY invoice_items_staff_insert ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY invoice_items_staff_update ON public.invoice_items FOR UPDATE TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY invoice_items_admin_delete ON public.invoice_items FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- FLEET / GPS / MAINTENANCE / DRIVER BEHAVIOR
-- =========================================================
CREATE TABLE public.fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number TEXT NOT NULL UNIQUE,
  model TEXT,
  driver_name TEXT,
  health_score INTEGER NOT NULL DEFAULT 100,
  fuel_pct INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'idle',
  last_service_at TIMESTAMPTZ,
  next_service_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gps_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  speed_kph NUMERIC(6,2) DEFAULT 0,
  heading INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  predicted_failure_date DATE,
  risk_level TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.driver_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- OPERATIONS MODULES
-- =========================================================
CREATE TABLE public.smart_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  contract_hash TEXT,
  value_usd NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  region TEXT NOT NULL,
  forecast_period TEXT NOT NULL,
  predicted_units INTEGER NOT NULL DEFAULT 0,
  confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.route_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km NUMERIC(10,2),
  est_time_hours NUMERIC(6,2),
  fuel_savings_pct NUMERIC(5,2) DEFAULT 0,
  recommended_route TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.replenishment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  warehouse TEXT NOT NULL,
  recommended_qty INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.edi_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pod_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  signature_url TEXT,
  photo_url TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE public.crossdock_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_shipment TEXT NOT NULL,
  outbound_shipment TEXT NOT NULL,
  dock_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.last_mile_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL,
  driver_name TEXT,
  customer_address TEXT NOT NULL,
  eta TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reverse_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rma_number TEXT NOT NULL UNIQUE,
  customer TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  refund_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- RISK & COMPLIANCE
-- =========================================================
CREATE TABLE public.compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.supplier_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  financial_score INTEGER NOT NULL DEFAULT 50,
  geopolitical_score INTEGER NOT NULL DEFAULT 50,
  operational_score INTEGER NOT NULL DEFAULT 50,
  overall_risk TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customs_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref TEXT NOT NULL,
  hs_code TEXT NOT NULL,
  origin_country TEXT,
  destination_country TEXT,
  declared_value NUMERIC(14,2) DEFAULT 0,
  duty NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- MONITORING
-- =========================================================
CREATE TABLE public.warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse TEXT NOT NULL,
  zone_code TEXT NOT NULL,
  density_pct INTEGER NOT NULL DEFAULT 0,
  activity_score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cold_chain_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  temperature_c NUMERIC(5,2) NOT NULL,
  humidity_pct NUMERIC(5,2),
  threshold_breach BOOLEAN NOT NULL DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.port_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  port_name TEXT NOT NULL,
  country TEXT,
  congestion_level TEXT NOT NULL DEFAULT 'low',
  avg_wait_hours NUMERIC(6,2) DEFAULT 0,
  vessels_in_queue INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.carbon_emissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,
  distance_km NUMERIC(10,2) NOT NULL DEFAULT 0,
  co2_kg NUMERIC(12,2) NOT NULL DEFAULT 0,
  offset_kg NUMERIC(12,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- PLATFORM SERVICES
-- =========================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ready',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  quote_currency TEXT NOT NULL,
  rate NUMERIC(14,6) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  lane TEXT NOT NULL,
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  surge_multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- GRANTS, RLS, POLICIES (uniform pattern)
-- =========================================================
DO $$
DECLARE t TEXT;
DECLARE tables TEXT[] := ARRAY[
  'fleet_vehicles','gps_tracks','maintenance_schedules','driver_events',
  'smart_contracts','demand_forecasts','route_optimizations','replenishment_orders',
  'edi_messages','pod_records','crossdock_operations','last_mile_deliveries','reverse_logistics',
  'compliance_events','supplier_risk_assessments','customs_declarations','risk_alerts',
  'warehouse_zones','cold_chain_readings','port_status','carbon_emissions',
  'reports','currency_rates','pricing_rules'
];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t||'_read_authed', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()))', t||'_staff_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (is_staff(auth.uid()))', t||'_staff_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (has_role(auth.uid(),''admin''))', t||'_admin_delete', t);
  END LOOP;
END $$;

-- Notifications: per-user visibility
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_read_own ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL OR is_staff(auth.uid()));
CREATE POLICY notif_staff_insert ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (is_staff(auth.uid()));
CREATE POLICY notif_update_own ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_staff(auth.uid()));
CREATE POLICY notif_admin_delete ON public.notifications FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;

-- Seed currency rates so multi-currency page has content
INSERT INTO public.currency_rates (base_currency, quote_currency, rate) VALUES
  ('USD','INR',83.21),('USD','EUR',0.92),('USD','GBP',0.78),
  ('USD','AED',3.67),('USD','SGD',1.34),('USD','JPY',155.4)
ON CONFLICT DO NOTHING;

-- Seed currency rates indexed by uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS currency_pair_uniq ON public.currency_rates (base_currency, quote_currency);
