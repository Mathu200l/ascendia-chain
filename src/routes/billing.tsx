import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Plus, Trash2, Download, Printer, FileText, Receipt } from "lucide-react";
import { generateInvoicePdf, type InvoiceData, type InvoiceItem } from "@/lib/invoice-pdf";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing & GST Invoices — Ascendia-Chain" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: BillingPage,
});

type LineDraft = { description: string; hsn_sac: string; quantity: number; unit_price: number; gst_rate: number };

const blankLine = (): LineDraft => ({ description: "", hsn_sac: "9967", quantity: 1, unit_price: 0, gst_rate: 18 });

function money(n: number, currency = "INR") {
  const sym = currency === "INR" ? "₹" : `${currency} `;
  return sym + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BillingPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientGstin, setClientGstin] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("Karnataka");
  const [isInterstate, setIsInterstate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([blankLine()]);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("invoices-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => {
        qc.invalidateQueries({ queryKey: ["invoices"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  // Totals
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const gstTotal = lines.reduce((s, l) => s + l.quantity * l.unit_price * (l.gst_rate / 100), 0);
  const cgst = isInterstate ? 0 : gstTotal / 2;
  const sgst = isInterstate ? 0 : gstTotal / 2;
  const igst = isInterstate ? gstTotal : 0;
  const total = subtotal + gstTotal;

  const updateLine = (i: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || lines.length === 0) {
      toast.error("Client name and at least one line item are required");
      return;
    }
    setSubmitting(true);
    try {
      const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: created, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invNumber,
          client_name: clientName,
          client_gstin: clientGstin || null,
          client_address: clientAddress || null,
          place_of_supply: placeOfSupply,
          is_interstate: isInterstate,
          subtotal, cgst, sgst, igst, total,
          status: "issued",
          due_date: dueDate || null,
          notes: notes || null,
          created_by: user?.id ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      const itemRows = lines.map((l) => ({
        invoice_id: created.id,
        description: l.description,
        hsn_sac: l.hsn_sac || null,
        quantity: l.quantity,
        unit_price: l.unit_price,
        gst_rate: l.gst_rate,
        line_total: l.quantity * l.unit_price * (1 + l.gst_rate / 100),
      }));
      const { error: itemsErr } = await supabase.from("invoice_items").insert(itemRows);
      if (itemsErr) throw itemsErr;

      toast.success(`Invoice ${invNumber} issued`);
      setClientName(""); setClientGstin(""); setClientAddress(""); setDueDate(""); setNotes("");
      setLines([blankLine()]); setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to issue invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async (invoiceId: string, action: "download" | "print" = "download") => {
    const { data: inv, error } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
    if (error || !inv) { toast.error("Invoice not found"); return; }
    const { data: items } = await supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId);
    const doc = generateInvoicePdf(inv as unknown as InvoiceData, (items ?? []) as unknown as InvoiceItem[]);
    if (action === "print") {
      doc.autoPrint();
      const url = doc.output("bloburl");
      window.open(url, "_blank");
    } else {
      doc.save(`${inv.invoice_number}.pdf`);
    }
  };

  const rows = invoices ?? [];
  const stats = {
    total: rows.length,
    issued: rows.filter((r) => r.status === "issued").length,
    paid: rows.filter((r) => r.status === "paid").length,
    revenue: rows.reduce((s, r) => s + Number(r.total || 0), 0),
  };

  return (
    <DashboardLayout title="Billing & GST Invoices" subtitle="Automated, GST-compliant tax invoicing">
      <div className="space-y-6 p-4 md:p-8">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Invoices", value: stats.total, icon: FileText },
            { label: "Issued", value: stats.issued, icon: Receipt },
            { label: "Paid", value: stats.paid, icon: Receipt },
            { label: "Total Billed", value: money(stats.revenue), icon: Receipt },
          ].map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Invoice Ledger</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "New GST Invoice"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="space-y-5 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-semibold">Issue new GST tax invoice</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Client Name *</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} required className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Client GSTIN</label>
                <input value={clientGstin} onChange={(e) => setClientGstin(e.target.value)} className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm font-mono outline-none focus:border-primary" placeholder="29ABCDE1234F1Z5" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Client Address</label>
                <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Place of Supply</label>
                <input value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isInterstate} onChange={(e) => setIsInterstate(e.target.checked)} className="h-4 w-4" />
                  Interstate supply (apply IGST instead of CGST+SGST)
                </label>
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-xl border border-border bg-surface/30">
              <div className="grid grid-cols-[2fr_1fr_60px_100px_70px_100px_36px] gap-2 border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div>Description</div><div>HSN/SAC</div><div>Qty</div><div>Unit Price</div><div>GST %</div><div className="text-right">Line Total</div><div />
              </div>
              {lines.map((l, i) => {
                const lt = l.quantity * l.unit_price * (1 + l.gst_rate / 100);
                return (
                  <div key={i} className="grid grid-cols-[2fr_1fr_60px_100px_70px_100px_36px] items-center gap-2 border-b border-border/30 px-3 py-2 last:border-0">
                    <input value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })} required placeholder="Freight services Bengaluru → Delhi" className="rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <input value={l.hsn_sac} onChange={(e) => updateLine(i, { hsn_sac: e.target.value })} className="rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs font-mono outline-none focus:border-primary" />
                    <input type="number" step="any" value={l.quantity} onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} className="rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs text-right outline-none focus:border-primary" />
                    <input type="number" step="any" value={l.unit_price} onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })} className="rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs text-right outline-none focus:border-primary" />
                    <select value={l.gst_rate} onChange={(e) => updateLine(i, { gst_rate: Number(e.target.value) })} className="rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-primary">
                      {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <div className="text-right font-mono text-xs">{money(lt)}</div>
                    <button type="button" onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))} disabled={lines.length === 1} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              <button type="button" onClick={() => setLines((p) => [...p, blankLine()])} className="flex w-full items-center justify-center gap-2 border-t border-border px-3 py-2 text-xs text-primary hover:bg-surface-elevated">
                <Plus className="h-3.5 w-3.5" /> Add Line Item
              </button>
            </div>

            {/* Totals + notes */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes / Terms</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Payment due within 30 days. Late fee 1.5%/mo." />
              </div>
              <div className="space-y-1.5 rounded-xl border border-border bg-surface/30 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{money(subtotal)}</span></div>
                {isInterstate ? (
                  <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span className="font-mono">{money(igst)}</span></div>
                ) : (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span className="font-mono">{money(cgst)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span className="font-mono">{money(sgst)}</span></div>
                  </>
                )}
                <div className="my-2 border-t border-border" />
                <div className="flex justify-between text-base font-bold"><span>Total</span><span className="font-mono text-primary">{money(total)}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-elevated">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
                {submitting ? "Issuing…" : "Issue Invoice"}
              </button>
            </div>
          </form>
        )}

        {/* Ledger */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">GST Type</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading invoices…</td></tr>}
                {!isLoading && rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No invoices yet. Click <span className="text-primary font-medium">New GST Invoice</span> to issue one.</td></tr>
                )}
                {rows.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/40 last:border-0 hover:bg-surface/40">
                    <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{inv.client_name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{inv.client_gstin || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(inv.issued_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs">{inv.is_interstate ? "IGST" : "CGST+SGST"}</td>
                    <td className="px-4 py-3 text-right font-mono">{money(Number(inv.total), inv.currency || "INR")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        inv.status === "paid" ? "bg-success/15 text-success" :
                        inv.status === "overdue" ? "bg-destructive/15 text-destructive" :
                        inv.status === "issued" ? "bg-primary/15 text-primary" :
                        "bg-muted/30 text-muted-foreground"
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => downloadPdf(inv.id, "download")} title="Download PDF" className="rounded-md border border-border bg-surface/60 p-1.5 text-muted-foreground hover:text-primary">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => downloadPdf(inv.id, "print")} title="Print" className="rounded-md border border-border bg-surface/60 p-1.5 text-muted-foreground hover:text-primary">
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Seller: Ascendia-Chain Logistics Pvt Ltd · GSTIN 29ABCDE1234F1Z5 · Bengaluru, KA. Need to adjust seller details?{" "}
          <Link to="/m/rbac" className="text-primary hover:underline">Manage roles</Link>.
        </p>
      </div>
    </DashboardLayout>
  );
}
