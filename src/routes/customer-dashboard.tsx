import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { MODULES } from "@/lib/modules.config";
import {
  ShoppingCart, Receipt, Plus, Minus, Trash2, LogOut, Sparkles,
  Package, CreditCard, CheckCircle2, Truck, Bell, LifeBuoy, Layers, Lock,
} from "lucide-react";


export const Route = createFileRoute("/customer-dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Customer Dashboard — Ascendia-Chain" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: CustomerDashboard,
});

type Plan = { id: string; name: string; tag: string; price: number; features: string[] };
const PLANS: Plan[] = [
  { id: "starter", name: "Starter Shipment Pack", tag: "Up to 500 shipments / mo", price: 149, features: ["Real-time GPS tracking", "Email & in-app alerts", "Standard reports"] },
  { id: "growth", name: "Growth Logistics Suite", tag: "Up to 5,000 shipments / mo", price: 599, features: ["Multi-modal tracking", "Route optimization", "API & EDI access"] },
  { id: "enterprise", name: "Enterprise Command Center", tag: "Unlimited + dedicated CSM", price: 1899, features: ["All Growth features", "Cold-chain & customs", "24/7 priority support"] },
];

type CartItem = { id: string; name: string; price: number; qty: number };

function cartKeyFor(userId: string) { return `ascendia_cart_${userId}`; }
function loadCart(userId: string): CartItem[] {
  if (typeof window === "undefined" || !userId) return [];
  try { return JSON.parse(localStorage.getItem(cartKeyFor(userId)) || "[]"); } catch { return []; }
}
function saveCart(userId: string, c: CartItem[]) {
  if (!userId) return;
  localStorage.setItem(cartKeyFor(userId), JSON.stringify(c));
}

function CustomerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "services" | "shipments" | "notifications" | "support" | "cart" | "billing">("overview");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUserId(u.id);
      setEmail(u.email ?? "");
      setName((u.user_metadata as any)?.full_name ?? "");
      setCart(loadCart(u.id));
    });
  }, []);

  useEffect(() => { if (userId) saveCart(userId, cart); }, [cart, userId]);

  // STRICT data isolation: every query filters by the current user's id.
  const { data: profile } = useQuery({
    queryKey: ["my-client-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["my-invoices", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data ?? [];
    },
  });

  const { data: shipments } = useQuery({
    queryKey: ["my-shipments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data ?? [];
    },
  });

  const { data: notifications } = useQuery({
    queryKey: ["my-notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data ?? [];
    },
  });

  const { data: tickets } = useQuery({
    queryKey: ["my-tickets", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data ?? [];
    },
  });


  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const addToCart = (p: Plan) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    toast.success(`${p.name} added to cart`);
    setTab("cart");
  };
  const changeQty = (id: string, delta: number) =>
    setCart((prev) => prev.flatMap((i) => (i.id === id ? (i.qty + delta <= 0 ? [] : [{ ...i, qty: i.qty + delta }]) : [i])));
  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const checkout = () => {
    if (cart.length === 0) return toast.error("Your cart is empty");
    toast.success("Order placed. Our team will reach out within 1 business day.");
    setCart([]);
    setTab("billing");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04060f] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=2400&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#04060f]/95 via-[#06091a]/90 to-[#0b1230]/95" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[160px]" />

      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-medium">{name || email || "Customer"}</div>
              <div className="text-[11px] text-white/50">{profile?.company_name ?? email}</div>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.1]"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 shadow-[0_30px_100px_-30px_rgba(40,80,200,0.45)] backdrop-blur-xl md:p-10"
          style={{ transform: "perspective(1800px) rotateX(1deg)" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" /> Your private command center
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
            Welcome{name ? `, ${name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            This dashboard shows <strong className="text-white">only your account</strong> — your cart, your billing, your shipments. No other company's data is visible here.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Stat icon={Truck} label="Your shipments" value={(shipments?.length ?? 0).toString()} accent="from-cyan-400 to-sky-500" />
            <Stat icon={Receipt} label="Your invoices" value={(invoices?.length ?? 0).toString()} accent="from-violet-400 to-fuchsia-500" />
            <Stat icon={Bell} label="Notifications" value={(notifications?.length ?? 0).toString()} accent="from-amber-300 to-orange-500" />
            <Stat icon={LifeBuoy} label="Support tickets" value={(tickets?.length ?? 0).toString()} accent="from-rose-400 to-pink-500" />
            <Stat icon={CreditCard} label="Cart total" value={`$${cartTotal.toLocaleString()}`} accent="from-emerald-300 to-teal-500" />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur">
          {[
            { id: "overview", label: "Plans", icon: Package },
            { id: "services", label: `Services (${MODULES.length})`, icon: Layers },
            { id: "shipments", label: `Shipments (${shipments?.length ?? 0})`, icon: Truck },
            { id: "notifications", label: `Alerts (${notifications?.length ?? 0})`, icon: Bell },
            { id: "support", label: `Support (${tickets?.length ?? 0})`, icon: LifeBuoy },
            { id: "cart", label: `Cart (${cart.length})`, icon: ShoppingCart },
            { id: "billing", label: "Billing", icon: Receipt },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition md:text-sm ${
                tab === t.id
                  ? "bg-gradient-to-r from-cyan-400/90 via-sky-500/90 to-violet-500/90 text-white shadow-[0_8px_30px_-8px_rgba(80,120,255,0.7)]"
                  : "text-white/60 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>


        <div className="mt-6">
          {tab === "overview" && (
            <div className="grid gap-5 md:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/40">
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl transition group-hover:bg-cyan-400/30" />
                  <div className="relative">
                    <div className="text-xs uppercase tracking-wider text-cyan-300">{p.tag}</div>
                    <h3 className="mt-1 font-display text-xl font-semibold">{p.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${p.price}</span>
                      <span className="text-xs text-white/50">/ month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-white/70">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => addToCart(p)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-4 py-2.5 text-sm font-semibold shadow-[0_8px_30px_-8px_rgba(80,120,255,0.7)] transition hover:opacity-95">
                      <Plus className="h-4 w-4" /> Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "cart" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingCart className="mx-auto h-10 w-10 text-white/30" />
                  <p className="mt-3 text-white/60">Your cart is empty.</p>
                  <button onClick={() => setTab("overview")} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm hover:bg-white/[0.1]">Browse plans</button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((i) => (
                      <div key={i.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{i.name}</div>
                          <div className="text-xs text-white/50">${i.price} / month</div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] p-1">
                          <button onClick={() => changeQty(i.id, -1)} className="rounded p-1 hover:bg-white/10"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm">{i.qty}</span>
                          <button onClick={() => changeQty(i.id, +1)} className="rounded p-1 hover:bg-white/10"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="w-20 text-right font-semibold">${(i.price * i.qty).toLocaleString()}</div>
                        <button onClick={() => removeItem(i.id)} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/50">Cart total</div>
                      <div className="text-2xl font-bold">${cartTotal.toLocaleString()}<span className="text-sm font-normal text-white/50"> / mo</span></div>
                    </div>
                    <button onClick={checkout} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-6 py-3 font-semibold shadow-[0_10px_40px_-10px_rgba(80,120,255,0.7)] transition hover:opacity-95">
                      <CreditCard className="h-4 w-4" /> Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "services" && (
            <div>
              <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-xs text-cyan-100/90">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>
                    Every service in our platform is available to your account. Data shown anywhere on this dashboard is filtered to <strong>your user ID only</strong> — admin-wide and other customers' data is never exposed.
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MODULES.map((m) => {
                  const Icon = (Icons as any)[m.icon] ?? Layers;
                  return (
                    <div key={m.slug} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/80 to-violet-500/80">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-cyan-300">{m.group}</div>
                          <div className="truncate font-semibold">{m.label}</div>
                          <p className="mt-1 line-clamp-2 text-xs text-white/60">{m.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "shipments" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Your shipments</h3>
                <span className="text-xs text-white/50">{shipments?.length ?? 0} total · only yours</span>
              </div>
              {(!shipments || shipments.length === 0) ? (
                <div className="py-12 text-center text-white/50">
                  <Truck className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-3 text-sm">No shipments linked to your account yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-white/50">
                      <tr>
                        <th className="px-4 py-3">Tracking</th>
                        <th className="px-4 py-3">Origin → Destination</th>
                        <th className="px-4 py-3">Mode</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {shipments.map((s: any) => (
                        <tr key={s.id} className="hover:bg-white/[0.03]">
                          <td className="px-4 py-3 font-mono text-xs">{s.tracking_number ?? s.id?.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-white/80">{s.origin} → {s.destination}</td>
                          <td className="px-4 py-3 capitalize text-white/70">{s.mode ?? "—"}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs capitalize text-cyan-300">{(s.status ?? "pending").replace(/_/g, " ")}</span></td>
                          <td className="px-4 py-3 text-white/60">{s.eta ? new Date(s.eta).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "notifications" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Your alerts</h3>
                <span className="text-xs text-white/50">{notifications?.length ?? 0} total · only yours</span>
              </div>
              {(!notifications || notifications.length === 0) ? (
                <div className="py-12 text-center text-white/50">
                  <Bell className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-3 text-sm">You're all caught up. New alerts will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium">{n.title}</div>
                          <span className="text-[10px] uppercase tracking-wider text-white/40">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        {n.body && <p className="mt-1 text-sm text-white/70">{n.body}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "support" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Your support tickets</h3>
                <span className="text-xs text-white/50">{tickets?.length ?? 0} total · only yours</span>
              </div>
              {(!tickets || tickets.length === 0) ? (
                <div className="py-12 text-center text-white/50">
                  <LifeBuoy className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-3 text-sm">No tickets yet. Reach out to support and your tickets will show here.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-white/50">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Opened</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tickets.map((t: any) => (
                        <tr key={t.id} className="hover:bg-white/[0.03]">
                          <td className="px-4 py-3">{t.subject}</td>
                          <td className="px-4 py-3 capitalize text-white/70">{t.priority ?? "normal"}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs capitalize text-emerald-300">{t.status ?? "open"}</span></td>
                          <td className="px-4 py-3 text-white/60">{new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "billing" && (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Your invoices</h3>
                <span className="text-xs text-white/50">{invoices?.length ?? 0} total</span>
              </div>
              {(!invoices || invoices.length === 0) ? (
                <div className="py-12 text-center text-white/50">
                  <Receipt className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-3 text-sm">No invoices yet. Once your subscription activates, only invoices issued to <strong>{profile?.company_name ?? "your company"}</strong> will appear here.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-white/50">
                      <tr>
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-white/[0.03]">
                          <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number ?? inv.id?.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-white/70">{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right font-semibold">₹{Number(inv.total ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">{inv.status ?? "issued"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${accent}`}>
        <Icon className="h-4 w-4 text-black/80" />
      </div>
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
      <div className="mt-0.5 text-2xl font-bold">{value}</div>
    </div>
  );
}
