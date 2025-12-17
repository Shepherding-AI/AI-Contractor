import { NextResponse } from "next/server";
import { getEstimate } from "@/lib/db";
import { stringify } from "csv-stringify/sync";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const row = getEstimate(id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const outputs = JSON.parse(row.outputs_json);
  const bom = outputs.bom || [];

  const csv = stringify(
    bom.map((x: any) => ({
      name: x.name ?? "",
      qty: x.qty ?? 0,
      unit: x.unit ?? "",
      notes: x.notes ?? "",
    })),
    { header: true }
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="BOM-${row.id}.csv"`,
    },
  });
}
