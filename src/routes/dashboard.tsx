import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Boxes, LayoutDashboard, MapPin, Cpu, FileLock2, Brain, Route as RouteIcon, PackageCheck, Truck, Undo2,
  Store, Plug, BarChart3, ShieldCheck, DollarSign, Bell, ScrollText, Gavel, Map, Receipt, AlertTriangle,
  HeartPulse, Wrench, Leaf, Container, TrendingUp, Headphones, Search, LogOut, Bell as BellIcon, Menu, X,
} from "lucide-react";
import { getAuth, logout } from "@/lib/auth";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NexusSCM" }] }),
  component: Dashboard,
});

const FEATURES = [
  { icon: MapPin, name: "Real-time GPS Tracking", stat: "1,284 active", trend: "+12%" },
  { icon: Cpu, name: "IoT Sensor Integration", stat: "48,210 devices", trend: "+4%" },
  { icon: FileLock2, name: "Smart Contracts", stat: "326 on-chain", trend: "+8%" },
  { icon: Brain, name: "AI Demand Forecasting", stat: "94.2% accuracy", trend: "+1.1%" },
  { icon: RouteIcon, name: "AI Route Optimization", stat: "$1.2M saved", trend: "+18%" },
  { icon: PackageCheck, name: "Inventory Replenishment", stat: "Auto: 87%", trend: "+6%" },
  { icon: Truck, name: "Multi-modal Transport", stat: "Road · Sea · Air", trend: "Live" },
  { icon: Undo2, name: "Reverse Logistics", stat: "2,341 returns", trend: "-9%" },
  { icon: Store, name: "Vendor Portal", stat: "1,892 vendors", trend: "+22" },
  { icon: Plug, name: "EDI Integration", stat: "X12 · EDIFACT", trend: "OK" },
  { icon: BarChart3, name: "Reporting Engine", stat: "412 reports", trend: "+30" },
  { icon: ShieldCheck, name: "Role-based Access", stat: "26 roles", trend: "—" },
  { icon: DollarSign, name: "Multi-currency", stat: "USD · EUR · JPY +12", trend: "Live" },
  { icon: Bell, name: "Push Notifications", stat: "98.7% delivery", trend: "+0.3%" },
  { icon: ScrollText, name: "Digital Proof of Delivery", stat: "12,840 POD", trend: "+15%" },
  { icon: Gavel, name: "Compliance Audit Trail", stat: "SOC2 · ISO", trend: "OK" },
  { icon: Map, name: "Warehouse Heatmap", stat: "32 facilities", trend: "Live" },
  { icon: Receipt, name: "Automated Invoicing", stat: "$8.4M processed", trend: "+11%" },
  { icon: AlertTriangle, name: "Supplier Risk Mgmt", stat: "7 high risk", trend: "-2" },
  { icon: HeartPulse, name: "Fleet Health Monitor", stat: "Healthy: 96%", trend: "+1%" },
  { icon: Wrench, name: "Predictive Maintenance", stat: "23 alerts", trend: "-5" },
  { icon: Leaf, name: "Carbon Footprint", stat: "-14% YoY", trend: "Good" },
  { icon: Container, name: "Cross-docking", stat: "Avg 42 min", trend: "-8%" },
  { icon: TrendingUp, name: "Dynamic Pricing", stat: "+6.4% margin", trend: "+0.8%" },
  { icon: Headphones, name: "Customer Support", stat: "94 open tickets", trend: "-12" },
];

const NAV = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: MapPin, label: "Tracking" },
  { icon: Truck, label: "Fleet" },
  { icon: PackageCheck, label: "Inventory" },
  { icon: Store, label: "Vendors" },
  { icon: BarChart3, label: "Analytics" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: Headphones, label: "Support" },
];

function Dashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (!a.authed) nav({ to: "/login" });
    else setUser(a.user || "Admin");
  }, [nav]);

  const shipmentData = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      d: `D${i + 1}`,
      shipments: 800 + Math.round(Math.sin(i / 2) * 200 + Math.random() * 150),
      delivered: 700 + Math.round(Math.sin(i / 2) * 180 + Math.random() * 120),
    })), []);

  const modeData = [
    { name: "Road", value: 5240, c: "var(--color-chart-1)" },
    { name: "Sea", value: 2180, c: "var(--color-chart-2)" },
    { name: "Air", value: 1420, c: "var(--color-chart-3)" },
    { name: "Rail", value: 880, c: "var(--color-chart-4)" },
  ];

  const regionData = [
    { r: "NA", v: 320 }, { r: "EU", v: 280 }, { r: "APAC", v: 410 },
    { r: "LATAM", v: 140 }, { r: "MEA", v: 90 },
  ];

  const handleLogout = () => { logout(); toast.success("Signed out"); nav({ to: "/login" }); };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-gradient-surface transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow"><Boxes className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-display font-bold">Nexus<span className="text-gradient">SCM</span></span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n, i) => (
            <button key={n.label} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          ))}
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

      {/* Main */}
      <div className="lg:pl-64">
        {/* Top bar */}
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
          {/* Hero stats */}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back, {user}</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Command Center</h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Live · synced 2s ago
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Active Shipments", value: "12,482", sub: "+8.2% vs last week", icon: Truck },
                { label: "On-time Delivery", value: "97.4%", sub: "+1.1% SLA", icon: PackageCheck },
                { label: "Revenue (MTD)", value: "$48.2M", sub: "+12.6%", icon: DollarSign },
                { label: "Open Incidents", value: "23", sub: "-5 today", icon: AlertTriangle },
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

          {/* Charts */}
          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Shipment volume</h3>
                  <p className="text-xs text-muted-foreground">Last 14 days · global</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={shipmentData}>
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
                    <Pie data={modeData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {modeData.map((m, i) => <Cell key={i} fill={m.c} />)}
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
              <h3 className="text-lg font-semibold">Regional throughput</h3>
              <p className="text-xs text-muted-foreground">Shipments (thousands)</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="r" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} cursor={{ fill: "var(--color-muted)" }} />
                    <Bar dataKey="v" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-semibold">Live activity</h3>
              <p className="text-xs text-muted-foreground">Last 5 minutes</p>
              <ul className="mt-4 space-y-3">
                {[
                  { c: "bg-success", t: "Shipment #A8821 delivered — Berlin DC", s: "12s ago" },
                  { c: "bg-primary", t: "AI rerouted 14 trucks · I-95 incident", s: "48s ago" },
                  { c: "bg-warning", t: "Sensor #TX-409 low battery", s: "1m ago" },
                  { c: "bg-accent", t: "Smart contract #SC-1187 executed", s: "2m ago" },
                  { c: "bg-destructive", t: "Supplier KORE-9 risk score ↑", s: "3m ago" },
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className={`mt-1.5 h-2 w-2 rounded-full ${a.c}`} />
                    <div className="flex-1">
                      <div className="text-foreground">{a.t}</div>
                      <div className="text-xs text-muted-foreground">{a.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 25 Features grid */}
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Platform modules</h2>
                <p className="text-sm text-muted-foreground">25 enterprise capabilities, unified</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {FEATURES.map((f) => (
                <button key={f.name} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elevated">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-success">{f.trend}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{f.stat}</div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
