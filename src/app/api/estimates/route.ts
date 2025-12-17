import { NextResponse } from "next/server";
import { listEstimates, upsertEstimate } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ items: listEstimates() });
}

const CreateSchema = z.object({
  id: z.string().min(6),
  title: z.string().min(1),
  zip: z.string().min(5),
  trade: z.string().min(1),
  customer_json: z.string(),
  inputs_json: z.string(),
  outputs_json: z.string()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateSchema.parse(body);
  upsertEstimate(parsed);
  return NextResponse.json({ ok: true });
}
