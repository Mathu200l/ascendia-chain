import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Customer Sign in — Ascendia-Chain" }] }),
  component: CustomerLogin,
});

function CustomerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast.success("Welcome back.");
      navigate({ to: "/customer-dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/customer-dashboard`,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/customer-dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04060f] text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#04060f]/95 via-[#06091a]/85 to-[#0b1230]/90" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[160px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link to="/"><Logo /></Link>
        </div>

        <div
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_40px_120px_-30px_rgba(40,80,200,0.55)] backdrop-blur-2xl md:p-10"
          style={{ transform: "perspective(1600px) rotateX(2deg)" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" /> Customer portal
          </div>
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-1.5 text-sm text-white/60">
            New here?{" "}
            <Link to="/register" className="text-cyan-300 hover:underline">Create an account</Link>
          </p>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
            <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <Field icon={Mail} label="Email">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
            </Field>
            <Field icon={Lock} label="Password">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
            </Field>
            <button
              disabled={loading}
              className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-4 py-3.5 font-semibold text-white shadow-[0_10px_40px_-10px_rgba(80,120,255,0.7)] transition hover:opacity-95 disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Clearly separated staff/admin access link */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/40">Internal team?</p>
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/[0.06] px-4 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/[0.12]"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Access Staff / Admin Panel
            </Link>
          </div>
        </div>
      </div>
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
