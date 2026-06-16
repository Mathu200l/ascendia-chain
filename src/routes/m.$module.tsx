import { createFileRoute, redirect, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getModule, type ModuleColumn, type ModuleField } from "@/lib/modules.config";
import { toast } from "sonner";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";

import { requireStaff } from "@/lib/role-guard";

export const Route = createFileRoute("/m/$module")({
  ssr: false,
  beforeLoad: requireStaff,
  component: ModulePage,
});

function fmtCell(value: unknown, col: ModuleColumn): React.ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (col.fmt === "money") return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (col.fmt === "pct") return `${value}%`;
  if (col.fmt === "date") return new Date(String(value)).toLocaleDateString();
  if (col.fmt === "datetime") return new Date(String(value)).toLocaleString();
  if (col.fmt === "badge") {
    const variant = col.badgeMap?.[String(value)] ?? "muted";
    const cls = {
      success: "bg-success/15 text-success",
      warning: "bg-warning/15 text-warning",
      destructive: "bg-destructive/15 text-destructive",
      primary: "bg-primary/15 text-primary",
      muted: "bg-muted/30 text-muted-foreground",
    }[variant];
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
        {String(value).replace(/_/g, " ")}
      </span>
    );
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function FormField({ field, value, onChange }: { field: ModuleField; value: unknown; onChange: (v: unknown) => void }) {
  const base = "w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary";
  if (field.type === "select") {
    return (
      <select className={base} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required}>
        <option value="">Select…</option>
        {field.options?.map((o) => (
          <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return <textarea className={`${base} min-h-[80px]`} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} placeholder={field.placeholder} />;
  }
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
        Yes
      </label>
    );
  }
  return (
    <input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      className={base}
      value={(value as string | number) ?? ""}
      onChange={(e) => onChange(field.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
      required={field.required}
      placeholder={field.placeholder}
      step="any"
    />
  );
}

function ModulePage() {
  const { module: slug } = useParams({ from: "/m/$module" });
  const def = getModule(slug);
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["module", slug],
    queryFn: async () => {
      if (!def) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase as any).from(def.table).select("*").limit(200);
      if (def.orderBy) q = q.order(def.orderBy.column, { ascending: def.orderBy.ascending ?? false });
      else q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!def,
  });

  // Realtime subscription
  useEffect(() => {
    if (!def) return;
    const channel = supabase
      .channel(`module-${def.table}`)
      .on("postgres_changes", { event: "*", schema: "public", table: def.table }, () => {
        qc.invalidateQueries({ queryKey: ["module", slug] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [def, slug, qc]);

  if (!def) {
    return (
      <DashboardLayout title="Module not found">
        <div className="p-8">
          <p className="text-muted-foreground">No module configured for &quot;{slug}&quot;.</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Overview
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      // strip empties
      Object.keys(payload).forEach((k) => { if (payload[k] === "" || payload[k] === null) delete payload[k]; });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await ((supabase as any).from(def.table)).insert(payload);
      if (error) throw error;
      toast.success(`${def.label} record created`);
      setForm({});
      setShowForm(false);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <DashboardLayout title={def.label} subtitle={def.description}>
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Group:</span> <span className="font-medium text-foreground">{def.group}</span>
            </div>
            <div className="rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Records:</span> <span className="font-mono font-medium text-primary">{rows.length}</span>
            </div>
            <div className="hidden rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs text-success md:inline-block">
              ● Realtime synced
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="rounded-lg border border-border bg-surface/60 p-2 text-muted-foreground hover:text-foreground" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> {showForm ? "Close" : "Add Record"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">New {def.label}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {def.fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </label>
                  <FormField field={f} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-elevated">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
                {submitting ? "Saving…" : "Save Record"}
              </button>
            </div>
          </form>
        )}

        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  {def.columns.map((c) => (
                    <th key={c.key} className="px-4 py-3">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={def.columns.length} className="px-4 py-10 text-center text-muted-foreground">Loading live data…</td></tr>
                )}
                {!isLoading && rows.length === 0 && (
                  <tr><td colSpan={def.columns.length} className="px-4 py-10 text-center text-muted-foreground">
                    No records yet. Click <span className="text-primary font-medium">Add Record</span> to insert one — updates stream live.
                  </td></tr>
                )}
                {rows.map((r, i) => (
                  <tr key={(r.id as string) ?? i} className="border-b border-border/40 last:border-0 hover:bg-surface/40">
                    {def.columns.map((c) => (
                      <td key={c.key} className="px-4 py-3">{fmtCell(r[c.key], c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
