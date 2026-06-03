import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Boxes, Activity, Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ascendia-Chain | AI Supply Chain Ecosystem" },
      { name: "description", content: "AI-powered, blockchain-secured supply chain management for global enterprises." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Boxes className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Ascendia<span className="text-gradient">-Chain</span></span>
          </div>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#security" className="hover:text-foreground">Security</a>
          </nav>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
            Admin Login <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent"></span>
          Trusted by Fortune 500 logistics teams worldwide
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] md:text-7xl">
          The operating system for <span className="text-gradient">global supply chains</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Real-time visibility, AI forecasting, IoT telemetry, and blockchain-backed contracts — unified in one enterprise-grade command center.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
            Launch Admin Console <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#features" className="inline-flex items-center rounded-xl border border-border bg-surface/60 px-6 py-3 font-semibold text-foreground transition hover:bg-surface-elevated">
            Explore platform
          </a>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { k: "99.99%", v: "Uptime SLA" },
            { k: "180+", v: "Countries" },
            { k: "12M+", v: "Shipments / yr" },
            { k: "<50ms", v: "Telemetry" },
          ].map((s) => (
            <div key={s.v} className="glass rounded-2xl p-5">
              <div className="font-display text-3xl font-bold text-gradient">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Activity, title: "Real-time telemetry", desc: "GPS, IoT sensors, fleet health & predictive maintenance streamed live." },
            { icon: Globe2, title: "AI orchestration", desc: "Demand forecasting, route optimization & dynamic pricing engines." },
            { icon: ShieldCheck, title: "Compliance-first", desc: "Blockchain audit trail, RBAC, EDI, and SOC2-grade security baked in." },
          ].map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-8 transition hover:border-primary/50 hover:shadow-elevated">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ascendia-Chain — AI Supply Chain Ecosystem
      </footer>
    </div>
  );
}
