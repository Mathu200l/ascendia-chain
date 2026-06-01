import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Search, Building2, Mail, Smartphone, Briefcase, FileBadge,
  Calendar, MessageSquare, CheckCircle2, Archive, Clock, X,
} from "lucide-react";
import { toast } from "sonner";

type ClientProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  mobile: string;
  dob: string | null;
  company_name: string;
  industry_type: string;
  tax_id: string;
  requirement_description: string;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — NexusSCM" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: ClientsPage,
});

function ClientsPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ClientProfile | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["client_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ClientProfile[];
    },
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("client_profiles_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_profiles" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const filtered = useMemo(() => {
    const list = data ?? [];
    return list.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const needle = q.trim().toLowerCase();
      const matchesQ = !needle ||
        c.full_name.toLowerCase().includes(needle) ||
        c.company_name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.industry_type.toLowerCase().includes(needle);
      return matchesStatus && matchesQ;
    });
  }, [data, q, statusFilter]);

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      pending: list.filter((c) => c.status === "pending").length,
      active: list.filter((c) => c.status === "active").length,
      archived: list.filter((c) => c.status === "archived").length,
    };
  }, [data]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("client_profiles").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Marked ${status}`); refetch(); setSelected((s) => s && s.id === id ? { ...s, status } : s); }
  };

  return (
    <DashboardLayout title="Client Onboardings" subtitle="Review companies and their submitted logistics requirements">
      <div className="border-b border-border bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search company, name, email…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>


      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <div>
          <p className="text-sm text-muted-foreground">Customer success</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Client Onboardings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review companies registered on NexusSCM and the logistics requirements they submitted.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total clients", value: counts.total, icon: Building2 },
            { label: "Pending review", value: counts.pending, icon: Clock, tone: "warning" },
            { label: "Active", value: counts.active, icon: CheckCircle2, tone: "success" },
            { label: "Archived", value: counts.archived, icon: Archive },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.tone === "success" ? "text-success" : s.tone === "warning" ? "text-warning" : "text-primary"}`} />
              </div>
              <div className="mt-2 font-display text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "active", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                statusFilter === s
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Loading clients…</td></tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No client registrations yet.</td></tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 transition last:border-0 hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.company_name}</div>
                      <div className="text-xs text-muted-foreground">{c.full_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{c.email}</div>
                      <div className="text-xs text-muted-foreground">{c.mobile}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.industry_type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(c)}
                        className="rounded-md border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selected && (
        <Drawer client={selected} onClose={() => setSelected(null)} onSetStatus={setStatus} />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/15 text-warning",
    active: "bg-success/15 text-success",
    archived: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${map[status] || "bg-primary/15 text-primary"}`}>
      {status}
    </span>
  );
}

function Drawer({
  client, onClose, onSetStatus,
}: { client: any; onClose: () => void; onSetStatus: (id: string, s: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-6 shadow-elevated md:p-8">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Client profile</p>
            <h2 className="font-display text-2xl font-bold">{client.company_name}</h2>
            <div className="mt-1 flex items-center gap-2"><StatusPill status={client.status} /></div>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Detail icon={Building2} label="Company">{client.company_name}</Detail>
          <Detail icon={Briefcase} label="Industry">{client.industry_type}</Detail>
          <Detail icon={FileBadge} label="Tax / Reg. ID">{client.tax_id}</Detail>
          <Detail icon={Calendar} label="Date of birth">
            {client.dob ? new Date(client.dob).toLocaleDateString() : "—"}
          </Detail>
          <Detail icon={Mail} label="Email">{client.email}</Detail>
          <Detail icon={Smartphone} label="Mobile">{client.mobile}</Detail>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Requirement description
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface/40 p-4 text-sm leading-relaxed">
            {client.requirement_description}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
          <button
            onClick={() => onSetStatus(client.id, "active")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90"
          >
            <CheckCircle2 className="h-4 w-4" /> Activate client
          </button>
          <button
            onClick={() => onSetStatus(client.id, "pending")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium hover:border-primary"
          >
            <Clock className="h-4 w-4" /> Mark pending
          </button>
          <button
            onClick={() => onSetStatus(client.id, "archived")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium hover:border-destructive hover:text-destructive"
          >
            <Archive className="h-4 w-4" /> Archive
          </button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Submitted {new Date(client.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
