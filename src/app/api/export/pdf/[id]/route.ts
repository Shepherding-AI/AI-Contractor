import { NextResponse } from "next/server";
import { getEstimate } from "@/lib/db";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

function wrapText(text: string, maxLen: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = (line ? line + " " : "") + w;
    if (test.length > maxLen) {
      if (line) lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = getEstimate(params.id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const inputs = JSON.parse(row.inputs_json);
  const outputs = JSON.parse(row.outputs_json);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // US Letter
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 760;
  const left = 48;
  const lineH = 14;

  const draw = (txt: string, bold = false, size = 12) => {
    page.drawText(txt, { x: left, y, size, font: bold ? fontBold : font });
    y -= lineH;
  };

  draw(row.title, true, 18);
  y -= 6;

  draw(`Trade: ${row.trade}   ZIP: ${row.zip}   Created: ${new Date(row.created_at).toLocaleString()}`, false, 10);
  y -= 8;

  const c = JSON.parse(row.customer_json);
  draw("Customer", true, 13);
  for (const l of wrapText(`${c.name} • ${c.address1}${c.address2 ? ", " + c.address2 : ""} • ${c.city}, ${c.state} ${c.zip}`, 90)) draw(l, false, 11);
  y -= 6;

  draw("Price Summary", true, 13);
  const t = outputs.totals;
  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;
  draw(`Labor: ${fmt(t.laborCost)}   Travel: ${fmt(t.travelCost)}   Materials: ${fmt(t.materialsCost)}   Overhead: ${fmt(t.overheadCost)}`, false, 11);
  draw(`Cost Subtotal: ${fmt(t.subtotalCost)}   Profit: ${fmt(t.profit)}   Price: ${fmt(t.price)}   Margin: ${Number(t.margin || 0).toFixed(1)}%`, false, 11);
  y -= 6;

  draw("Scope of Work", true, 13);
  for (const l of wrapText(String(outputs.scopeOfWork || ""), 95)) {
    if (y < 80) break;
    draw(l, false, 11);
  }
  y -= 6;

  draw("Assumptions", true, 13);
  for (const a of (outputs.assumptions || []).slice(0, 12)) {
    if (y < 80) break;
    for (const l of wrapText(`• ${a}`, 95)) draw(l, false, 11);
  }
  y -= 6;

  draw("Exclusions", true, 13);
  for (const e of (outputs.exclusions || []).slice(0, 12)) {
    if (y < 80) break;
    for (const l of wrapText(`• ${e}`, 95)) draw(l, false, 11);
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.title.replace(/[^a-z0-9\-\_ ]/gi, "").slice(0, 40) || "proposal"}.pdf"`
    }
  });
}
