import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoiceItem = {
  description: string;
  hsn_sac?: string | null;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  line_total: number;
};

export type InvoiceData = {
  invoice_number: string;
  client_name: string;
  client_gstin?: string | null;
  client_address?: string | null;
  seller_name: string;
  seller_gstin: string;
  seller_address: string;
  place_of_supply: string;
  is_interstate: boolean;
  issued_at: string;
  due_date?: string | null;
  currency: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
  notes?: string | null;
};

const NAVY: [number, number, number] = [12, 19, 45];
const CYAN: [number, number, number] = [6, 182, 212];
const SLATE: [number, number, number] = [71, 85, 105];

function money(n: number, currency = "INR") {
  const symbol = currency === "INR" ? "Rs. " : `${currency} `;
  return symbol + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateInvoicePdf(invoice: InvoiceData, items: InvoiceItem[]): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 90, pageW, 4, "F");

  // Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("NexusSCM", margin, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(190, 220, 240);
  doc.text("Enterprise Supply Chain Platform", margin, 58);
  doc.text("GST-compliant Tax Invoice", margin, 71);

  // Invoice meta (right)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAX INVOICE", pageW - margin, 42, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice #: ${invoice.invoice_number}`, pageW - margin, 58, { align: "right" });
  doc.text(`Issued: ${new Date(invoice.issued_at).toLocaleDateString()}`, pageW - margin, 71, { align: "right" });
  if (invoice.due_date) doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, pageW - margin, 84, { align: "right" });

  // From / To blocks
  let y = 120;
  doc.setTextColor(...SLATE);
  doc.setFontSize(8);
  doc.text("FROM", margin, y);
  doc.text("BILL TO", pageW / 2 + 10, y);
  y += 14;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(invoice.seller_name, margin, y);
  doc.text(invoice.client_name, pageW / 2 + 10, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const sellerAddrLines = doc.splitTextToSize(invoice.seller_address, pageW / 2 - 60);
  const clientAddrLines = doc.splitTextToSize(invoice.client_address || "—", pageW / 2 - 60);
  doc.text(sellerAddrLines, margin, y);
  doc.text(clientAddrLines, pageW / 2 + 10, y);
  const maxLines = Math.max(sellerAddrLines.length, clientAddrLines.length);
  y += maxLines * 11 + 6;
  doc.setTextColor(...SLATE);
  doc.text(`GSTIN: ${invoice.seller_gstin}`, margin, y);
  doc.text(`GSTIN: ${invoice.client_gstin || "—"}`, pageW / 2 + 10, y);
  y += 12;
  doc.text(`Place of Supply: ${invoice.place_of_supply}`, margin, y);
  doc.text(`Type: ${invoice.is_interstate ? "Interstate (IGST)" : "Intrastate (CGST + SGST)"}`, pageW / 2 + 10, y);
  y += 18;

  // Items table
  autoTable(doc, {
    startY: y,
    head: [["#", "Description", "HSN/SAC", "Qty", "Unit Price", "GST %", "Line Total"]],
    body: items.map((it, i) => [
      i + 1,
      it.description,
      it.hsn_sac || "—",
      Number(it.quantity).toLocaleString(),
      money(it.unit_price, invoice.currency),
      `${it.gst_rate}%`,
      money(it.line_total, invoice.currency),
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 6, lineColor: [220, 220, 230] },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: "center", cellWidth: 24 },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  // Totals box
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const boxX = pageW - margin - 240;
  const boxW = 240;
  doc.setFillColor(248, 250, 252);
  doc.rect(boxX, finalY, boxW, 110, "F");
  doc.setDrawColor(220, 220, 230);
  doc.rect(boxX, finalY, boxW, 110);

  const labelX = boxX + 14;
  const valueX = boxX + boxW - 14;
  let ty = finalY + 22;
  doc.setFontSize(10);
  doc.setTextColor(...SLATE);
  doc.text("Subtotal", labelX, ty);
  doc.setTextColor(20, 20, 20);
  doc.text(money(invoice.subtotal, invoice.currency), valueX, ty, { align: "right" });
  ty += 18;
  if (invoice.is_interstate) {
    doc.setTextColor(...SLATE);
    doc.text("IGST", labelX, ty);
    doc.setTextColor(20, 20, 20);
    doc.text(money(invoice.igst, invoice.currency), valueX, ty, { align: "right" });
    ty += 18;
  } else {
    doc.setTextColor(...SLATE);
    doc.text("CGST", labelX, ty);
    doc.setTextColor(20, 20, 20);
    doc.text(money(invoice.cgst, invoice.currency), valueX, ty, { align: "right" });
    ty += 18;
    doc.setTextColor(...SLATE);
    doc.text("SGST", labelX, ty);
    doc.setTextColor(20, 20, 20);
    doc.text(money(invoice.sgst, invoice.currency), valueX, ty, { align: "right" });
    ty += 18;
  }
  // Total bar
  doc.setFillColor(...NAVY);
  doc.rect(boxX, ty - 2, boxW, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL DUE", labelX, ty + 18);
  doc.text(money(invoice.total, invoice.currency), valueX, ty + 18, { align: "right" });

  // Notes
  if (invoice.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.text("Notes", margin, finalY + 12);
    doc.setTextColor(40, 40, 50);
    const noteLines = doc.splitTextToSize(invoice.notes, pageW - margin - boxW - margin - 20);
    doc.text(noteLines, margin, finalY + 26);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(1);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text("This is a system-generated GST tax invoice issued under the NexusSCM platform.", margin, footerY + 14);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, pageW - margin, footerY + 14, { align: "right" });

  return doc;
}
