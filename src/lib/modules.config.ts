// Central registry for the 30 enterprise modules.
// The generic /m/$module route reads from this file.

export type FieldType = "text" | "number" | "select" | "textarea" | "date" | "boolean";

export type ModuleField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

export type ModuleColumn = {
  key: string;
  label: string;
  fmt?: "money" | "pct" | "date" | "datetime" | "badge";
  badgeMap?: Record<string, "success" | "warning" | "destructive" | "primary" | "muted">;
};

export type ModuleDef = {
  slug: string;
  label: string;
  group: string;
  icon: string; // lucide-react export name
  table: string;
  description: string;
  orderBy?: { column: string; ascending?: boolean };
  fields: ModuleField[];
  columns: ModuleColumn[];
  defaults?: Record<string, unknown>;
};

const sev = { high: "destructive", medium: "warning", low: "success", critical: "destructive", info: "primary" } as ModuleColumn["badgeMap"];
const statusBadge = {
  active: "success", inactive: "muted", pending: "warning", draft: "muted",
  delivered: "success", in_transit: "primary", delayed: "destructive",
  scheduled: "primary", completed: "success", open: "warning", resolved: "success",
  online: "success", offline: "destructive", proposed: "primary", approved: "success",
  paid: "success", overdue: "destructive", issued: "primary",
} as ModuleColumn["badgeMap"];

export const MODULES: ModuleDef[] = [
  {
    slug: "gps", label: "Real-time GPS Tracking", group: "Operations", icon: "MapPin",
    table: "gps_tracks", description: "Live GPS pings from the fleet. Records stream into the dashboard in real time.",
    orderBy: { column: "recorded_at", ascending: false },
    fields: [
      { key: "lat", label: "Latitude", type: "number", required: true },
      { key: "lng", label: "Longitude", type: "number", required: true },
      { key: "speed_kph", label: "Speed (kph)", type: "number" },
      { key: "heading", label: "Heading (°)", type: "number" },
    ],
    columns: [
      { key: "lat", label: "Lat" },
      { key: "lng", label: "Lng" },
      { key: "speed_kph", label: "Speed" },
      { key: "heading", label: "Heading" },
      { key: "recorded_at", label: "Recorded", fmt: "datetime" },
    ],
  },
  {
    slug: "fleet", label: "Fleet Health Monitor", group: "Operations", icon: "Truck",
    table: "fleet_vehicles", description: "Vehicle health, fuel, and service status across the fleet.",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "plate_number", label: "Plate Number", type: "text", required: true },
      { key: "model", label: "Model", type: "text" },
      { key: "driver_name", label: "Driver", type: "text" },
      { key: "health_score", label: "Health Score (0-100)", type: "number" },
      { key: "fuel_pct", label: "Fuel %", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["idle", "in_transit", "maintenance", "offline"] },
    ],
    columns: [
      { key: "plate_number", label: "Plate" },
      { key: "model", label: "Model" },
      { key: "driver_name", label: "Driver" },
      { key: "health_score", label: "Health" },
      { key: "fuel_pct", label: "Fuel %" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "rbac", label: "Role-based Access Control", group: "Platform", icon: "ShieldCheck",
    table: "user_roles", description: "Assigned platform roles. Admins can grant or revoke access.",
    fields: [
      { key: "user_id", label: "User ID (UUID)", type: "text", required: true },
      { key: "role", label: "Role", type: "select", options: ["admin", "manager", "operator", "viewer", "client", "vendor"], required: true },
    ],
    columns: [
      { key: "user_id", label: "User" },
      { key: "role", label: "Role", fmt: "badge", badgeMap: { admin: "destructive", manager: "primary", operator: "success", viewer: "muted", client: "warning", vendor: "warning" } },
      { key: "created_at", label: "Granted", fmt: "datetime" },
    ],
  },
  {
    slug: "iot", label: "IoT Sensor Integration", group: "Monitoring", icon: "Cpu",
    table: "iot_sensors", description: "Connected sensors streaming readings into the platform.",
    fields: [
      { key: "device_id", label: "Device ID", type: "text", required: true },
      { key: "type", label: "Type", type: "select", options: ["temperature", "humidity", "shock", "gps", "door"], required: true },
      { key: "battery_pct", label: "Battery %", type: "number" },
      { key: "last_reading", label: "Last Reading", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["online", "offline", "fault"] },
    ],
    columns: [
      { key: "device_id", label: "Device" },
      { key: "type", label: "Type" },
      { key: "battery_pct", label: "Battery" },
      { key: "last_reading", label: "Reading" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "smart-contracts", label: "Smart Contracts", group: "Operations", icon: "FileLock2",
    table: "smart_contracts", description: "Blockchain-anchored contracts and their lifecycle.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "counterparty", label: "Counterparty", type: "text", required: true },
      { key: "contract_hash", label: "Hash", type: "text" },
      { key: "value_usd", label: "Value (USD)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["pending", "active", "completed", "terminated"] },
      { key: "effective_date", label: "Effective", type: "date" },
      { key: "expiry_date", label: "Expiry", type: "date" },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "counterparty", label: "Counterparty" },
      { key: "value_usd", label: "Value", fmt: "money" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
      { key: "expiry_date", label: "Expiry", fmt: "date" },
    ],
  },
  {
    slug: "demand-forecasts", label: "AI Demand Forecasting", group: "Intelligence", icon: "Brain",
    table: "demand_forecasts", description: "ML-driven SKU-level demand predictions by region.",
    fields: [
      { key: "sku", label: "SKU", type: "text", required: true },
      { key: "region", label: "Region", type: "text", required: true },
      { key: "forecast_period", label: "Period (e.g. 2026-Q3)", type: "text", required: true },
      { key: "predicted_units", label: "Predicted Units", type: "number" },
      { key: "confidence", label: "Confidence %", type: "number" },
    ],
    columns: [
      { key: "sku", label: "SKU" },
      { key: "region", label: "Region" },
      { key: "forecast_period", label: "Period" },
      { key: "predicted_units", label: "Units" },
      { key: "confidence", label: "Confidence" },
    ],
  },
  {
    slug: "routes", label: "AI Route Optimization", group: "Intelligence", icon: "Route",
    table: "route_optimizations", description: "AI-recommended routing with fuel and time savings.",
    fields: [
      { key: "origin", label: "Origin", type: "text", required: true },
      { key: "destination", label: "Destination", type: "text", required: true },
      { key: "distance_km", label: "Distance (km)", type: "number" },
      { key: "est_time_hours", label: "ETA (h)", type: "number" },
      { key: "fuel_savings_pct", label: "Fuel Savings %", type: "number" },
      { key: "recommended_route", label: "Recommended Route", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["proposed", "approved", "executed"] },
    ],
    columns: [
      { key: "origin", label: "Origin" },
      { key: "destination", label: "Destination" },
      { key: "distance_km", label: "Distance" },
      { key: "est_time_hours", label: "ETA" },
      { key: "fuel_savings_pct", label: "Savings %" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "replenishment", label: "Inventory Replenishment", group: "Inventory", icon: "PackageCheck",
    table: "replenishment_orders", description: "Recommended SKU replenishments by warehouse.",
    fields: [
      { key: "sku", label: "SKU", type: "text", required: true },
      { key: "warehouse", label: "Warehouse", type: "text", required: true },
      { key: "recommended_qty", label: "Recommended Qty", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["pending", "approved", "fulfilled"] },
    ],
    columns: [
      { key: "sku", label: "SKU" },
      { key: "warehouse", label: "Warehouse" },
      { key: "recommended_qty", label: "Qty" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "vendors", label: "Vendor Portal", group: "Partners", icon: "Store",
    table: "vendors", description: "Active vendor partners and risk posture.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "contact_email", label: "Email", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "risk_score", label: "Risk Score (0-100)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["active", "suspended", "onboarding"] },
    ],
    columns: [
      { key: "name", label: "Vendor" },
      { key: "country", label: "Country" },
      { key: "contact_email", label: "Email" },
      { key: "risk_score", label: "Risk" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "edi", label: "EDI Integration", group: "Platform", icon: "Plug",
    table: "edi_messages", description: "EDI document flow with trading partners.",
    fields: [
      { key: "partner", label: "Partner", type: "text", required: true },
      { key: "doc_type", label: "Doc Type (e.g. 850, 856)", type: "text", required: true },
      { key: "direction", label: "Direction", type: "select", options: ["inbound", "outbound"], required: true },
      { key: "status", label: "Status", type: "select", options: ["received", "processed", "error"] },
    ],
    columns: [
      { key: "partner", label: "Partner" },
      { key: "doc_type", label: "Doc" },
      { key: "direction", label: "Direction" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: { received: "primary", processed: "success", error: "destructive" } },
      { key: "created_at", label: "When", fmt: "datetime" },
    ],
  },
  {
    slug: "reports", label: "Reporting Engine", group: "Platform", icon: "BarChart3",
    table: "reports", description: "Generated business reports.",
    fields: [
      { key: "name", label: "Report Name", type: "text", required: true },
      { key: "type", label: "Type", type: "select", options: ["operational", "financial", "compliance", "sustainability"], required: true },
      { key: "status", label: "Status", type: "select", options: ["ready", "generating", "failed"] },
    ],
    columns: [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: { ready: "success", generating: "warning", failed: "destructive" } },
      { key: "created_at", label: "Created", fmt: "datetime" },
    ],
  },
  {
    slug: "currency", label: "Multi-currency Support", group: "Platform", icon: "DollarSign",
    table: "currency_rates", description: "FX rates used across pricing and invoicing.",
    fields: [
      { key: "base_currency", label: "Base", type: "text", required: true },
      { key: "quote_currency", label: "Quote", type: "text", required: true },
      { key: "rate", label: "Rate", type: "number", required: true },
    ],
    columns: [
      { key: "base_currency", label: "Base" },
      { key: "quote_currency", label: "Quote" },
      { key: "rate", label: "Rate" },
      { key: "updated_at", label: "Updated", fmt: "datetime" },
    ],
  },
  {
    slug: "notifications", label: "Push Notifications", group: "Platform", icon: "Bell",
    table: "notifications", description: "System notifications dispatched to users.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "body", label: "Body", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: ["info", "alert", "warning", "success"] },
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", fmt: "badge", badgeMap: { info: "primary", alert: "destructive", warning: "warning", success: "success" } },
      { key: "read", label: "Read" },
      { key: "created_at", label: "When", fmt: "datetime" },
    ],
  },
  {
    slug: "pod", label: "Proof of Delivery", group: "Operations", icon: "ScrollText",
    table: "pod_records", description: "Signed proofs of delivery captured by drivers.",
    fields: [
      { key: "recipient_name", label: "Recipient Name", type: "text", required: true },
      { key: "signature_url", label: "Signature URL", type: "text" },
      { key: "photo_url", label: "Photo URL", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "recipient_name", label: "Recipient" },
      { key: "delivered_at", label: "Delivered", fmt: "datetime" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    slug: "compliance", label: "Compliance Audit Trail", group: "Risk", icon: "Gavel",
    table: "compliance_events", description: "Immutable audit-grade compliance log.",
    fields: [
      { key: "entity", label: "Entity", type: "text", required: true },
      { key: "event_type", label: "Event Type", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "severity", label: "Severity", type: "select", options: ["info", "low", "medium", "high", "critical"] },
    ],
    columns: [
      { key: "entity", label: "Entity" },
      { key: "event_type", label: "Event" },
      { key: "severity", label: "Severity", fmt: "badge", badgeMap: sev },
      { key: "created_at", label: "When", fmt: "datetime" },
    ],
  },
  {
    slug: "warehouse-heatmap", label: "Warehouse Heatmap", group: "Monitoring", icon: "Map",
    table: "warehouse_zones", description: "Per-zone density and activity for warehouse heatmaps.",
    fields: [
      { key: "warehouse", label: "Warehouse", type: "text", required: true },
      { key: "zone_code", label: "Zone", type: "text", required: true },
      { key: "density_pct", label: "Density %", type: "number" },
      { key: "activity_score", label: "Activity", type: "number" },
    ],
    columns: [
      { key: "warehouse", label: "Warehouse" },
      { key: "zone_code", label: "Zone" },
      { key: "density_pct", label: "Density" },
      { key: "activity_score", label: "Activity" },
    ],
  },
  {
    slug: "supplier-risk", label: "Supplier Risk Management", group: "Risk", icon: "AlertTriangle",
    table: "supplier_risk_assessments", description: "Scored risk assessments per supplier.",
    fields: [
      { key: "vendor_id", label: "Vendor ID (UUID, optional)", type: "text" },
      { key: "financial_score", label: "Financial (0-100)", type: "number" },
      { key: "geopolitical_score", label: "Geopolitical", type: "number" },
      { key: "operational_score", label: "Operational", type: "number" },
      { key: "overall_risk", label: "Overall", type: "select", options: ["low", "medium", "high", "critical"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "vendor_id", label: "Vendor" },
      { key: "financial_score", label: "Fin" },
      { key: "geopolitical_score", label: "Geo" },
      { key: "operational_score", label: "Ops" },
      { key: "overall_risk", label: "Risk", fmt: "badge", badgeMap: sev },
    ],
  },
  {
    slug: "maintenance", label: "Predictive Maintenance", group: "Operations", icon: "Wrench",
    table: "maintenance_schedules", description: "AI-predicted maintenance windows.",
    fields: [
      { key: "task", label: "Task", type: "text", required: true },
      { key: "predicted_failure_date", label: "Predicted Failure", type: "date" },
      { key: "risk_level", label: "Risk", type: "select", options: ["low", "medium", "high", "critical"] },
      { key: "status", label: "Status", type: "select", options: ["scheduled", "in_progress", "completed", "skipped"] },
    ],
    columns: [
      { key: "task", label: "Task" },
      { key: "predicted_failure_date", label: "Predicted", fmt: "date" },
      { key: "risk_level", label: "Risk", fmt: "badge", badgeMap: sev },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "carbon", label: "Carbon Footprint Tracker", group: "Sustainability", icon: "Leaf",
    table: "carbon_emissions", description: "CO₂ emissions per shipment, with offset tracking.",
    fields: [
      { key: "mode", label: "Mode", type: "select", options: ["road", "sea", "air", "rail"], required: true },
      { key: "distance_km", label: "Distance (km)", type: "number" },
      { key: "co2_kg", label: "CO₂ (kg)", type: "number" },
      { key: "offset_kg", label: "Offset (kg)", type: "number" },
    ],
    columns: [
      { key: "mode", label: "Mode" },
      { key: "distance_km", label: "Distance" },
      { key: "co2_kg", label: "CO₂" },
      { key: "offset_kg", label: "Offset" },
      { key: "recorded_at", label: "When", fmt: "datetime" },
    ],
  },
  {
    slug: "crossdock", label: "Cross-docking Management", group: "Operations", icon: "Container",
    table: "crossdock_operations", description: "Inbound to outbound cross-dock scheduling.",
    fields: [
      { key: "inbound_shipment", label: "Inbound", type: "text", required: true },
      { key: "outbound_shipment", label: "Outbound", type: "text", required: true },
      { key: "dock_id", label: "Dock", type: "text", required: true },
      { key: "scheduled_at", label: "Scheduled", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["scheduled", "in_progress", "completed"] },
    ],
    columns: [
      { key: "inbound_shipment", label: "Inbound" },
      { key: "outbound_shipment", label: "Outbound" },
      { key: "dock_id", label: "Dock" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "pricing", label: "Dynamic Pricing Engine", group: "Platform", icon: "TrendingUp",
    table: "pricing_rules", description: "Lane-level pricing rules with surge multipliers.",
    fields: [
      { key: "rule_name", label: "Rule Name", type: "text", required: true },
      { key: "lane", label: "Lane (e.g. BLR-DEL)", type: "text", required: true },
      { key: "base_price", label: "Base Price", type: "number" },
      { key: "surge_multiplier", label: "Surge ×", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["active", "paused"] },
    ],
    columns: [
      { key: "rule_name", label: "Rule" },
      { key: "lane", label: "Lane" },
      { key: "base_price", label: "Base", fmt: "money" },
      { key: "surge_multiplier", label: "×" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "cold-chain", label: "Cold Chain Monitoring", group: "Monitoring", icon: "Thermometer",
    table: "cold_chain_readings", description: "Temperature-controlled shipment readings.",
    fields: [
      { key: "temperature_c", label: "Temperature (°C)", type: "number", required: true },
      { key: "humidity_pct", label: "Humidity %", type: "number" },
      { key: "threshold_breach", label: "Breach?", type: "boolean" },
    ],
    columns: [
      { key: "temperature_c", label: "°C" },
      { key: "humidity_pct", label: "RH %" },
      { key: "threshold_breach", label: "Breach" },
      { key: "recorded_at", label: "When", fmt: "datetime" },
    ],
  },
  {
    slug: "last-mile", label: "Last-Mile Delivery", group: "Operations", icon: "Bike",
    table: "last_mile_deliveries", description: "Final-leg delivery queue and status.",
    fields: [
      { key: "tracking_number", label: "Tracking #", type: "text", required: true },
      { key: "driver_name", label: "Driver", type: "text" },
      { key: "customer_address", label: "Address", type: "textarea", required: true },
      { key: "eta", label: "ETA", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["queued", "out_for_delivery", "delivered", "failed"] },
    ],
    columns: [
      { key: "tracking_number", label: "Tracking" },
      { key: "driver_name", label: "Driver" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
      { key: "eta", label: "ETA", fmt: "date" },
    ],
  },
  {
    slug: "support", label: "Customer Support Desk", group: "Platform", icon: "Headphones",
    table: "support_tickets", description: "Customer issues and SLAs.",
    fields: [
      { key: "subject", label: "Subject", type: "text", required: true },
      { key: "priority", label: "Priority", type: "select", options: ["low", "normal", "high", "urgent"] },
      { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "resolved"] },
    ],
    columns: [
      { key: "subject", label: "Subject" },
      { key: "priority", label: "Priority", fmt: "badge", badgeMap: { low: "muted", normal: "primary", high: "warning", urgent: "destructive" } },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
      { key: "created_at", label: "Opened", fmt: "datetime" },
    ],
  },
  {
    slug: "customs", label: "Customs Clearance & Compliance", group: "Risk", icon: "ScrollText",
    table: "customs_declarations", description: "Customs declarations and duties.",
    fields: [
      { key: "shipment_ref", label: "Shipment Ref", type: "text", required: true },
      { key: "hs_code", label: "HS Code", type: "text", required: true },
      { key: "origin_country", label: "Origin", type: "text" },
      { key: "destination_country", label: "Destination", type: "text" },
      { key: "declared_value", label: "Declared Value", type: "number" },
      { key: "duty", label: "Duty", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["pending", "cleared", "held"] },
    ],
    columns: [
      { key: "shipment_ref", label: "Shipment" },
      { key: "hs_code", label: "HS" },
      { key: "declared_value", label: "Value", fmt: "money" },
      { key: "duty", label: "Duty", fmt: "money" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: { pending: "warning", cleared: "success", held: "destructive" } },
    ],
  },
  {
    slug: "port-status", label: "Live Port & Terminal Tracking", group: "Monitoring", icon: "Anchor",
    table: "port_status", description: "Live congestion at global ports.",
    fields: [
      { key: "port_name", label: "Port", type: "text", required: true },
      { key: "country", label: "Country", type: "text" },
      { key: "congestion_level", label: "Congestion", type: "select", options: ["low", "medium", "high", "critical"] },
      { key: "avg_wait_hours", label: "Avg Wait (h)", type: "number" },
      { key: "vessels_in_queue", label: "Vessels Queued", type: "number" },
    ],
    columns: [
      { key: "port_name", label: "Port" },
      { key: "country", label: "Country" },
      { key: "congestion_level", label: "Congestion", fmt: "badge", badgeMap: sev },
      { key: "avg_wait_hours", label: "Wait" },
      { key: "vessels_in_queue", label: "Queue" },
    ],
  },
  {
    slug: "driver-events", label: "Driver Behavior Analytics", group: "Operations", icon: "Activity",
    table: "driver_events", description: "Harsh braking, speeding, and other driver events.",
    fields: [
      { key: "driver_name", label: "Driver", type: "text", required: true },
      { key: "event_type", label: "Event", type: "select", options: ["harsh_brake", "speeding", "idling", "harsh_acceleration", "rest_break"], required: true },
      { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "driver_name", label: "Driver" },
      { key: "event_type", label: "Event" },
      { key: "severity", label: "Severity", fmt: "badge", badgeMap: sev },
      { key: "occurred_at", label: "When", fmt: "datetime" },
    ],
  },
  {
    slug: "reverse-logistics", label: "Reverse Logistics", group: "Operations", icon: "Undo2",
    table: "reverse_logistics", description: "Returns and refund processing.",
    fields: [
      { key: "rma_number", label: "RMA #", type: "text", required: true },
      { key: "customer", label: "Customer", type: "text", required: true },
      { key: "reason", label: "Reason", type: "textarea" },
      { key: "refund_amount", label: "Refund (USD)", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["requested", "approved", "received", "refunded", "rejected"] },
    ],
    columns: [
      { key: "rma_number", label: "RMA" },
      { key: "customer", label: "Customer" },
      { key: "refund_amount", label: "Refund", fmt: "money" },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
  {
    slug: "risk-alerts", label: "AI Risk Mitigation Panel", group: "Risk", icon: "AlertOctagon",
    table: "risk_alerts", description: "AI-detected supply-chain risks with recommended actions.",
    fields: [
      { key: "category", label: "Category", type: "select", options: ["geopolitical", "weather", "financial", "operational", "cyber"], required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"] },
      { key: "recommended_action", label: "Recommended Action", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["open", "mitigating", "resolved"] },
    ],
    columns: [
      { key: "title", label: "Alert" },
      { key: "category", label: "Category" },
      { key: "severity", label: "Severity", fmt: "badge", badgeMap: sev },
      { key: "status", label: "Status", fmt: "badge", badgeMap: statusBadge },
    ],
  },
];

export function getModule(slug: string): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}

// Sidebar order (32 entries: Overview, Clients, Billing + 30 module routes)
export type NavItem = { label: string; icon: string; group: string; to: string };

export const SIDEBAR: NavItem[] = [
  { label: "Overview", icon: "LayoutDashboard", group: "Command", to: "/dashboard" },
  { label: "Clients", icon: "Users", group: "Command", to: "/clients" },
  { label: "Billing & GST Invoices", icon: "Receipt", group: "Command", to: "/billing" },
  ...MODULES.map((m) => ({
    label: m.label,
    icon: m.icon,
    group: m.group,
    to: `/m/${m.slug}`,
  })),
];
