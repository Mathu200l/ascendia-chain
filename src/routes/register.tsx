import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  User, Mail, Smartphone, Lock, Building2, Briefcase, FileBadge, Calendar,
  MessageSquare, ArrowRight, ShieldCheck, Truck, Warehouse,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your Ascendia-Chain account" },
      { name: "description", content: "Onboard your company to Ascendia-Chain — describe your logistics, warehousing, and shipping requirements." },
    ],
  }),
  component: RegisterPage,
});

const INDUSTRIES = [
  "Transport & Logistics",
  "Warehousing",
  "Retail",
  "Manufacturing",
  "E-commerce",
  "Distribution",
  "FMCG",
  "Pharmaceuticals",
  "Other",
];

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    dob: "",
    password: "",
    company_name: "",
    industry_type: INDUSTRIES[0],
    tax_id: "",
    requirement_description: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (form.requirement_description.trim().length < 20) { toast.error("Please describe your requirement in at least 20 characters"); return; }
    setLoading(true);
    try {
      const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: form.full_name, company_name: form.company_name },
        },
      });
      if (signUpErr) throw signUpErr;
      const userId = signUp.user?.id;
      if (!userId) throw new Error("Account created — please sign in.");

      // Insert client profile (RLS: user_id must equal auth.uid())
      const { error: insErr } = await supabase.from("client_profiles").insert({
        user_id: userId,
        full_name: form.full_name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        dob: form.dob || null,
        company_name: form.company_name.trim(),
        industry_type: form.industry_type,
        tax_id: form.tax_id.trim(),
        requirement_description: form.requirement_description.trim(),
        status: "pending",
      });
      if (insErr) throw insErr;

      // Assign 'client' role (best effort)
      await supabase.from("user_roles").insert({ user_id: userId, role: "client" as never });

      toast.success("Welcome to Ascendia-Chain. Your account is being provisioned.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left: Logistics imagery */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1600&q=80"
          alt="Global logistics fleet at a distribution hub"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/70 to-background/50" />
        <div className="absolute inset-0 bg-gradient-glow opacity-40" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/"><Logo /></Link>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Enterprise onboarding
            </div>
            <h2 className="font-display text-5xl font-bold leading-[1.05]">
              Connect your supply chain to <span className="text-gradient">Ascendia-Chain</span>
            </h2>
            <p className="max-w-md text-muted-foreground">
              Tell us about your operations. Our team reviews every requirement and provisions
              a tailored command-center within 24 hours.
            </p>

            <div className="grid max-w-md gap-3 pt-2">
              {[
                { icon: Truck, t: "Real-time GPS, fleet & multi-modal tracking" },
                { icon: Warehouse, t: "Warehousing, cross-dock & inventory automation" },
                { icon: ShieldCheck, t: "SOC2-ready · RLS on every record · MFA enforced" },
              ].map((i) => (
                <div key={i.t} className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm">
                  <i.icon className="h-4 w-4 text-primary" /> {i.t}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">© Ascendia-Chain · AI Supply Chain Ecosystem</div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="relative flex items-center justify-center overflow-y-auto p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-surface" />

        <div className="w-full max-w-xl">
          <div className="mb-6 flex justify-center lg:hidden"><Logo size="lg" /></div>

          <div className="glass rounded-3xl border border-border/60 p-7 shadow-elevated md:p-9">
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold">Create your account</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Already onboarded? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field icon={User} label="Full name">
                  <input required value={form.full_name} onChange={update("full_name")} placeholder="Jane Doe" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
                <Field icon={Mail} label="Work email">
                  <input required type="email" value={form.email} onChange={update("email")} placeholder="jane@acme.com" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
                <Field icon={Smartphone} label="Mobile">
                  <input required value={form.mobile} onChange={update("mobile")} placeholder="+1 555 123 4567" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
                <Field icon={Calendar} label="Date of birth">
                  <input type="date" value={form.dob} onChange={update("dob")} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
                <Field icon={Building2} label="Company name">
                  <input required value={form.company_name} onChange={update("company_name")} placeholder="Acme Logistics Inc." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
                <Field icon={Briefcase} label="Industry">
                  <select required value={form.industry_type} onChange={update("industry_type")} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60">
                    {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}
                  </select>
                </Field>
                <Field icon={FileBadge} label="Tax / Registration ID">
                  <input required value={form.tax_id} onChange={update("tax_id")} placeholder="EIN / GSTIN / VAT" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
                <Field icon={Lock} label="Password">
                  <input required type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 characters" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60" />
                </Field>
              </div>

              <Field icon={MessageSquare} label="Describe your logistics / shipping requirement">
                <textarea
                  required
                  value={form.requirement_description}
                  onChange={update("requirement_description")}
                  rows={4}
                  placeholder="E.g. We move 800 SKUs/month from 3 warehouses across APAC, need temperature-controlled fleet visibility, EDI integration with our ERP, and route optimization for last-mile."
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </Field>

              <button
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creating account…" : <>Create account <ArrowRight className="h-4 w-4" /></>}
              </button>

              <p className="pt-1 text-center text-[11px] text-muted-foreground">
                By creating an account you agree to our enterprise terms & data processing addendum.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <div className="rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 transition focus-within:border-primary focus-within:shadow-glow">
        {children}
      </div>
    </label>
  );
}
