import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Truck, PackageCheck, DollarSign, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/dashboard.functions";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Command Center — NexusSCM" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: Dashboard,
});

const MODE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function Dashboard() {
  const fetchData = useServerFn(getDashboardData);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchData(),
    refetchInterval: 15000,
  });

  // Realtime: recalc top stats when any tracked table changes
  useEffect(() => {
    const tables = ["shipments", "invoices", "inventory_items", "risk_alerts", "fleet_vehicles", "support_tickets"];
    const channel = supabase.channel("overview-rt");
    tables.forEach((t) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table: t }, () => {
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      });
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const k = data?.kpis;
  const trend = data?.trend ?? [];
  const modes = (data?.modes ?? []).filter((m) => m.value > 0);

  return (
    <DashboardLayout title="Command Center" subtitle="Live operations across all 30 modules">
      <main className="space-y-8 p-4 md:p-8">
        <section>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Active Shipments", value: k ? k.active.toLocaleString() : "—", sub: k ? `${k.total} total · ${k.delayed} delayed` : "", icon: Truck },
                { label: "On-time Delivery", value: k ? `${k.onTimePct}%` : "—", sub: "SLA performance", icon: PackageCheck },
                { label: "Pipeline Value", value: k ? fmtMoney(k.revenue) : "—", sub: `${k?.inventoryCount ?? 0} SKUs · ${fmtMoney(k?.inventoryValue ?? 0)} inv.`, icon: DollarSign },
                { label: "Open Incidents", value: k ? (k.openTickets + k.highRiskVendors).toString() : "—", sub: `${k?.lowStock ?? 0} low stock · ${k?.sensorsOnline ?? 0}/${k?.sensors ?? 0} sensors`, icon: AlertTriangle },
              ].map((s) => (
                <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-elevated">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-primary opacity-10 blur-2xl transition group-hover:opacity-30" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-3 font-display text-3xl font-bold">{s.value}</div>
                  <div className="mt-1 text-xs text-success">{s.sub}</div>
                </div>
              ))}
            </div>
          </section>


          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Shipment volume</h3>
                  <p className="text-xs text-muted-foreground">Last 14 days · live from database</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="shipments" stroke="var(--color-chart-1)" fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="delivered" stroke="var(--color-chart-2)" fill="url(#g2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-semibold">Transport modes</h3>
              <p className="text-xs text-muted-foreground">Active flows</p>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={modes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {modes.map((_, i) => <Cell key={i} fill={MODE_COLORS[i % MODE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
              <h3 className="text-lg font-semibold">Recent shipments</h3>
              <p className="text-xs text-muted-foreground">Live feed from shipments table</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-3">Tracking</th>
                      <th className="py-2 pr-3">Route</th>
                      <th className="py-2 pr-3">Mode</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
                    {data?.recentShipments.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-3 font-mono text-xs">{s.tracking_number}</td>
                        <td className="py-3 pr-3">
                          <div className="text-foreground">{s.origin}</div>
                          <div className="text-xs text-muted-foreground">→ {s.destination}</div>
                        </td>
                        <td className="py-3 pr-3 capitalize">{s.mode}</td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            s.status === "delivered" ? "bg-success/15 text-success" :
                            s.status === "delayed" ? "bg-destructive/15 text-destructive" :
                            "bg-primary/15 text-primary"
                          }`}>{s.status.replace("_", " ")}</span>
                        </td>
                        <td className="py-3 pr-3 text-right font-mono text-xs">{fmtMoney(Number(s.value_usd || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-semibold">Supplier risk</h3>
              <p className="text-xs text-muted-foreground">Top exposures</p>
              <ul className="mt-4 space-y-3">
                {data?.highRiskVendors.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{v.status}</div>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${v.risk_score >= 70 ? "bg-destructive/15 text-destructive" : v.risk_score >= 50 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                      {v.risk_score}
                    </div>
                  </li>
                ))}
                {(!data || data.highRiskVendors.length === 0) && !isLoading && (
                  <li className="text-sm text-muted-foreground">No elevated vendor risk.</li>
                )}
              </ul>
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold">Platform modules</h2>
              <p className="text-sm text-muted-foreground">25 enterprise capabilities, unified</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {FEATURES.map((f) => (
                <button key={f.name} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elevated">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-sm font-medium text-foreground">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Operational</div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
