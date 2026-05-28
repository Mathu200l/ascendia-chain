import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [shipments, inventory, vendors, sensors, tickets] = await Promise.all([
      supabase.from("shipments").select("id, status, mode, value_usd, created_at, origin, destination, tracking_number, carrier, eta").order("created_at", { ascending: false }),
      supabase.from("inventory_items").select("id, quantity, reorder_level, unit_price, warehouse"),
      supabase.from("vendors").select("id, name, risk_score, status"),
      supabase.from("iot_sensors").select("id, status, battery_pct"),
      supabase.from("support_tickets").select("id, status, priority"),
    ]);

    const ship = shipments.data ?? [];
    const inv = inventory.data ?? [];
    const ven = vendors.data ?? [];
    const sen = sensors.data ?? [];
    const tic = tickets.data ?? [];

    const active = ship.filter((s) => s.status === "in_transit").length;
    const delivered = ship.filter((s) => s.status === "delivered").length;
    const delayed = ship.filter((s) => s.status === "delayed").length;
    const total = ship.length;
    const onTimePct = total > 0 ? Math.round(((delivered + active) / total) * 1000) / 10 : 0;
    const revenue = ship.reduce((sum, s) => sum + Number(s.value_usd || 0), 0);

    const inventoryValue = inv.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
    const lowStock = inv.filter((i) => i.quantity <= i.reorder_level).length;

    const highRiskVendors = ven.filter((v) => v.risk_score >= 60).length;
    const sensorsOnline = sen.filter((s) => s.status === "online").length;
    const openTickets = tic.filter((t) => t.status !== "resolved").length;

    // Mode breakdown
    const modeMap: Record<string, number> = { road: 0, sea: 0, air: 0, rail: 0 };
    ship.forEach((s) => { modeMap[s.mode] = (modeMap[s.mode] || 0) + 1; });

    // 14-day shipment trend
    const days: { d: string; shipments: number; delivered: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const start = new Date(now); start.setDate(now.getDate() - i); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(start.getDate() + 1);
      const day = ship.filter((s) => { const d = new Date(s.created_at); return d >= start && d < end; });
      days.push({
        d: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        shipments: day.length,
        delivered: day.filter((s) => s.status === "delivered").length,
      });
    }

    return {
      kpis: {
        active, delivered, delayed, total, onTimePct,
        revenue, inventoryValue, lowStock,
        highRiskVendors, sensorsOnline, openTickets,
        vendors: ven.length, sensors: sen.length, inventoryCount: inv.length,
      },
      modes: Object.entries(modeMap).map(([name, value]) => ({ name, value })),
      trend: days,
      recentShipments: ship.slice(0, 8),
      highRiskVendors: ven.filter((v) => v.risk_score >= 50).sort((a, b) => b.risk_score - a.risk_score).slice(0, 5),
    };
  });
