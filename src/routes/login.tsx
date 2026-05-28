import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Boxes, Lock, User, Mail, Smartphone, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import { DEMO_USER, DEMO_PASS, setAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin Login — NexusSCM" }] }),
  component: LoginPage,
});

type Step = "credentials" | "mfa" | "otp";

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === DEMO_USER && password === DEMO_PASS) {
        toast.success("Credentials verified. Sending OTP codes…");
        setStep("mfa");
      } else {
        toast.error("Invalid credentials");
      }
    }, 700);
  };

  const sendOtp = () => {
    toast.success("OTP sent to admin@nexusscm.io and +1 ••• ••• 4421");
    setStep("otp");
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (emailOtp.length === 6 && mobileOtp.length === 6) {
        setAuth({ authed: true, user: username });
        toast.success("Authenticated. Welcome back.");
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Both OTPs must be 6 digits");
      }
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-gradient-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Nexus<span className="text-gradient">SCM</span></span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="font-display text-5xl font-bold leading-tight">
            Secure command center for <span className="text-gradient">global logistics</span>
          </h2>
          <p className="max-w-md text-muted-foreground">
            Multi-factor authentication protects every entry point. Your sessions are encrypted end-to-end with rotating keys and full audit logging.
          </p>
          <div className="grid max-w-md gap-3">
            {[
              { icon: ShieldCheck, t: "SOC2 Type II + ISO 27001" },
              { icon: Lock, t: "Zero-trust session architecture" },
              { icon: KeyRound, t: "Hardware-key & biometric ready" },
            ].map((i) => (
              <div key={i.t} className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm">
                <i.icon className="h-4 w-4 text-primary" /> {i.t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">© NexusSCM — All systems nominal</div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary"><Boxes className="h-5 w-5 text-primary-foreground" /></div>
            <span className="font-display text-lg font-bold">Nexus<span className="text-gradient">SCM</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {step === "credentials" && "Admin sign in"}
              {step === "mfa" && "Multi-factor authentication"}
              {step === "otp" && "Verify your identity"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === "credentials" && "Enter your enterprise credentials to continue."}
              {step === "mfa" && "We'll send a one-time code to your registered email and mobile."}
              {step === "otp" && "Enter the 6-digit codes sent to your email and mobile."}
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-2">
            {(["credentials", "mfa", "otp"] as Step[]).map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${["credentials", "mfa", "otp"].indexOf(step) >= i ? "bg-gradient-primary" : "bg-muted"}`} />
              </div>
            ))}
          </div>

          {step === "credentials" && (
            <form onSubmit={submitCreds} className="space-y-4">
              <Field icon={User} label="Username">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="SupplyChainAdmin" className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60" required />
              </Field>
              <Field icon={Lock} label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60" required />
              </Field>
              <button disabled={loading} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
                {loading ? "Verifying…" : <>Continue <ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="rounded-lg border border-border bg-surface/50 p-3 text-xs text-muted-foreground">
                <span className="font-mono text-foreground">Demo:</span> SupplyChainAdmin / SupplyChainPassword
              </p>
            </form>
          )}

          {step === "mfa" && (
            <div className="space-y-4">
              <div className="glass flex items-center gap-3 rounded-xl p-4">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Email verification</div>
                  <div className="text-xs text-muted-foreground">admin@nexusscm.io</div>
                </div>
                <span className="text-xs text-success">Enabled</span>
              </div>
              <div className="glass flex items-center gap-3 rounded-xl p-4">
                <Smartphone className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Mobile SMS</div>
                  <div className="text-xs text-muted-foreground">+1 ••• ••• 4421</div>
                </div>
                <span className="text-xs text-success">Enabled</span>
              </div>
              <button onClick={sendOtp} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
                Send OTP codes <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <Field icon={Mail} label="Email OTP">
                <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" inputMode="numeric" className="w-full bg-transparent font-mono text-lg tracking-[0.5em] text-foreground outline-none placeholder:text-muted-foreground/40" required />
              </Field>
              <Field icon={Smartphone} label="Mobile OTP">
                <input value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="654321" inputMode="numeric" className="w-full bg-transparent font-mono text-lg tracking-[0.5em] text-foreground outline-none placeholder:text-muted-foreground/40" required />
              </Field>
              <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
                {loading ? "Verifying…" : <>Verify & sign in <ArrowRight className="h-4 w-4" /></>}
              </button>
              <button type="button" onClick={() => setStep("mfa")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                ← Resend codes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition focus-within:border-primary focus-within:shadow-glow">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}
