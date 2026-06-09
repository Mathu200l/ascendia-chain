import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  User, Mail, Building2, Briefcase, Lock, MessageSquare, ArrowRight,
  Sparkles, Truck, Globe2, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/customer-signup")({
  head: () => ({
    meta: [
      { title: "Join Ascendia-Chain — Customer Signup" },
      { name: "description", content: "Create your customer account and tell us about your logistics & shipping requirements." },
    ],
  }),
  component: CustomerSignup,
});

const INDUSTRIES = [
  "Transport & Logistics", "Warehousing", "Retail", "Manufacturing",
  "E-commerce", "Distribution", "FMCG", "Pharmaceuticals", "Other",
];

function CustomerSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    company_name: "",
    industry_type: INDUSTRIES[0],
    password: "",
    requirement_description: "",
  });

  const update = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (form.requirement_description.trim().length < 20)
      return toast.error("Please describe your requirement in at least 20 characters");

    setLoading(true);
    try {
      const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/customer-dashboard`,
          data: { full_name: form.full_name, company_name: form.company_name },
        },
      });
      if (signUpErr) throw signUpErr;
      const userId = signUp.user?.id;
      if (!userId) throw new Error("Account created — please sign in.");

      const { error: insErr } = await supabase.from("client_profiles").insert({
        user_id: userId,
        full_name: form.full_name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        company_name: form.company_name.trim(),
        industry_type: form.industry_type,
        tax_id: "",
        requirement_description: form.requirement_description.trim(),
        status: "pending",
      });
      if (insErr) console.warn(insErr);

      await supabase.from("user_roles").insert({ user_id: userId, role: "client" as never });

      toast.success("Welcome aboard! Provisioning your customer portal…");
      navigate({ to: "/customer-dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/customer-dashboard`,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/customer-dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04060f] text-foreground">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=2400&q=80')",
        }}
      />
      {/* Color overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#04060f]/95 via-[#06091a]/85 to-[#0b1230]/90" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#5b8cff]/25 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-[#22d3ee]/20 blur-[160px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#a855f7]/15 blur-[120px]" />

      {/* Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:py-14">
        {/* Left hero panel */}
        <div className="flex flex-col justify-between">
          <Link to="/"><Logo /></Link>

          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-cyan-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> New customer portal · 2026
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
              Pilot the future of{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                global supply
              </span>{" "}
              chains.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
              Tell us how your goods move — across oceans, warehouses, or the last mile —
              and we'll provision a tailored command center within 24 hours.
            </p>

            {/* 3D floating tiles */}
            <div className="relative mt-10 h-[260px]" style={{ perspective: "1400px" }}>
              {[
                { icon: Truck, t: "Live Fleet", sub: "1,284 active", c: "from-cyan-400 to-sky-500", x: 0, y: 20, r: -12, d: 0 },
                { icon: Globe2, t: "Routes", sub: "27 countries", c: "from-violet-400 to-fuchsia-500", x: 180, y: 60, r: 6, d: 0.6 },
                { icon: ShieldCheck, t: "SOC2 + RLS", sub: "All systems nominal", c: "from-emerald-300 to-teal-500", x: 50, y: 150, r: -4, d: 1.2 },
              ].map((tile, i) => (
                <div
                  key={i}
                  className="absolute w-64 rounded-2xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_30px_80px_-20px_rgba(80,120,255,0.45)] backdrop-blur-xl"
                  style={{
                    transform: `translate3d(${tile.x}px, ${tile.y}px, 0) rotateX(8deg) rotateY(${tile.r}deg)`,
                    transformStyle: "preserve-3d",
                    animation: `float 6s ease-in-out ${tile.d}s infinite alternate`,
                  }}
                >
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tile.c} shadow-lg`}>
                    <tile.icon className="h-5 w-5 text-black/80" />
                  </div>
                  <div className="text-sm font-semibold">{tile.t}</div>
                  <div className="text-xs text-white/60">{tile.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden text-xs text-white/40 lg:block">
            © Ascendia-Chain · AI Supply Chain Ecosystem
          </div>
        </div>

        {/* Right form card */}
        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_40px_120px_-30px_rgba(40,80,200,0.55)] backdrop-blur-2xl md:p-9"
            style={{ transform: "perspective(1600px) rotateY(-2deg) rotateX(1deg)" }}
          >
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Create your customer account</h2>
              <p className="mt-1.5 text-sm text-white/60">
                Already have one?{" "}
                <Link to="/customer-login" className="text-cyan-300 hover:underline">Sign in</Link>
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading}
              className="group mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12] disabled:opacity-60"
            >
              <GoogleIcon />
              {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
              <div className="h-px flex-1 bg-white/10" /> or with email <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              <div className="grid gap-3.5 md:grid-cols-2">
                <Field icon={User} label="Full name">
                  <input required value={form.full_name} onChange={update("full_name")} placeholder="Jane Doe" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </Field>
                <Field icon={Mail} label="Work email">
                  <input required type="email" value={form.email} onChange={update("email")} placeholder="jane@acme.com" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </Field>
                <Field icon={Building2} label="Company">
                  <input required value={form.company_name} onChange={update("company_name")} placeholder="Acme Logistics" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </Field>
                <Field icon={Briefcase} label="Industry">
                  <select required value={form.industry_type} onChange={update("industry_type")} className="w-full bg-transparent text-sm text-white outline-none">
                    {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-[#0b1230]">{i}</option>)}
                  </select>
                </Field>
                <Field icon={Mail} label="Mobile">
                  <input value={form.mobile} onChange={update("mobile")} placeholder="+1 555 123 4567" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </Field>
                <Field icon={Lock} label="Password">
                  <input required type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 characters" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </Field>
              </div>

              <Field icon={MessageSquare} label="Describe your logistics / shipping requirement">
                <textarea
                  required
                  rows={4}
                  value={form.requirement_description}
                  onChange={update("requirement_description")}
                  placeholder="E.g. We move 800 SKUs/month across APAC, need temperature-controlled fleet visibility, EDI integration with our ERP, and last-mile route optimization."
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/30"
                />
              </Field>

              <button
                disabled={loading}
                className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-4 py-3.5 font-semibold text-white shadow-[0_10px_40px_-10px_rgba(80,120,255,0.7)] transition hover:opacity-95 disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? "Creating your portal…" : <>Create account <ArrowRight className="h-4 w-4" /></>}
              </button>

              <p className="pt-1 text-center text-[11px] text-white/40">
                By continuing you agree to our terms & data processing addendum.
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translate3d(var(--x,0), var(--y,0), 0) rotateX(8deg) rotateY(-6deg) translateY(0); }
          100% { transform: translate3d(var(--x,0), var(--y,0), 0) rotateX(8deg) rotateY(-6deg) translateY(-14px); }
        }
      `}</style>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 transition focus-within:border-cyan-300/60 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]">
        {children}
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.9 29.1 5 24 5 16.3 5 9.7 9.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c5 0 9.5-1.9 12.9-5l-6-4.9C29 34.8 26.6 35.5 24 35.5c-5.3 0-9.6-3.1-11.2-7.5l-6.5 5C9.6 38.6 16.3 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6 4.9c-.4.4 6.5-4.7 6.5-14.3 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
