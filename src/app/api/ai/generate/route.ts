import { NextResponse } from "next/server";
import { z } from "zod";
import { generateOutputs } from "@/lib/ai";
import { Inputs } from "@/lib/types";

export const runtime = "nodejs";

const Schema = z.object({
  inputs: z.any()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.parse(body);
    const outputs = await generateOutputs(parsed.inputs as Inputs);
    return NextResponse.json({ outputs });
  } catch (e: any) {
    const message = e?.message || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
