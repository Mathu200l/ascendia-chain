import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, MapPin, Cpu, FileLock2, Brain, Route as RouteIcon, PackageCheck, Truck, Undo2,
  Store, Plug, BarChart3, ShieldCheck, DollarSign, Bell, ScrollText, Gavel, Map, Receipt, AlertTriangle,
  HeartPulse, Wrench, Leaf, Container, TrendingUp, Headphones, Search, LogOut, Bell as BellIcon, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/dashboard.functions";
import { Logo } from "@/components/Logo";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NexusSCM" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: Dashboard,
});

const FEATURES = [
  { icon: MapPin, name: "Real-time GPS Tracking" },
  { icon: Cpu, name: "IoT Sensor Integration" },
  { icon: FileLock2, name: "Smart Contracts" },
  { icon: Brain, name: "AI Demand Forecasting" },
  { icon: RouteIcon, name: "AI Route Optimization" },
  { icon: PackageCheck, name: "Inventory Replenishment" },
  { icon: Truck, name: "Multi-modal Transport" },
  { icon: Undo2, name: "Reverse Logistics" },
  { icon: Store, name: "Vendor Portal" },
  { icon: Plug, name: "EDI Integration" },
  { icon: BarChart3, name: "Reporting Engine" },
  { icon: ShieldCheck, name: "Role-based Access" },
  { icon: DollarSign, name: "Multi-currency" },
  { icon: Bell, name: "Push Notifications" },
  { icon: ScrollText, name: "Proof of Delivery" },
  { icon: Gavel, name: "Compliance Audit Trail" },
  { icon: Map, name: "Warehouse Heatmap" },
  { icon: Receipt, name: "Automated Invoicing" },
  { icon: AlertTriangle, name: "Supplier Risk Mgmt" },
  { icon: HeartPulse, name: "Fleet Health Monitor" },
  { icon: Wrench, name: "Predictive Maintenance" },
  { icon: Leaf, name: "Carbon Footprint" },
  { icon: Container, name: "Cross-docking" },
  { icon: TrendingUp, name: "Dynamic Pricing" },
  { icon: Headphones, name: "Customer Support" },
];

const NAV: { icon: any; label: string; to?: string }[] = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: Store, label: "Clients", to: "/dashboard/clients" },
  { icon: MapPin, label: "Tracking" },
  { icon: Truck, label: "Fleet" },
  { icon: PackageCheck, label: "Inventory" },
  { icon: BarChart3, label: "Analytics" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: Headphones, label: "Support" },
];

const MODE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const fetchData = useServerFn(getDashboardData);
  const [user, setUser] = useState<string>("Admin");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Admin");
    });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchData(),
    refetchInterval: 15000,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const k = data?.kpis;
  const trend = data?.trend ?? [];
  const modes = (data?.modes ?? []).filter((m) => m.value > 0);

  return (
    <div className="min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-gradient-surface transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/"><Logo size="sm" /></Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => {
            const cls = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition text-muted-foreground hover:bg-surface-elevated hover:text-foreground";
            if (n.to) {
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition bg-primary/10 text-primary" }}
                  inactiveProps={{ className: cls }}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            }
            return (
              <button key={n.label} className={cls}>
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{(user[0] || "A").toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user}</div>
                <div className="text-xs text-muted-foreground">Super Admin</div>
              </div>
              <button onClick={handleLogout} title="Sign out" className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-destructive"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 md:max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search shipments, vendors, SKUs…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          </div>
          <button className="relative rounded-lg border border-border bg-surface/60 p-2.5 hover:bg-surface-elevated">
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent"></span>
          </button>
        </header>

        <main className="space-y-8 p-4 md:p-8">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back, {user}</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Command Center</h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Live · auto-refresh 15s
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
