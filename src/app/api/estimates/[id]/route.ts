import { NextResponse } from "next/server";
import { deleteEstimate, getEstimate } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = getEstimate(params.id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ row });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  deleteEstimate(params.id);
  return NextResponse.json({ ok: true });
}
