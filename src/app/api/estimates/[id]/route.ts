import { NextResponse } from "next/server";
import { deleteEstimate, getEstimate } from "@/lib/db";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const row = getEstimate(id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ row });
}

export async function DELETE(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  deleteEstimate(id);
  return NextResponse.json({ ok: true });
}
