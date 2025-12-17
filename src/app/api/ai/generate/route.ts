import { NextResponse } from "next/server";
import { z } from "zod";
import { generateOutputs } from "@/lib/ai";
import { Inputs } from "@/lib/types";

export const runtime = "nodejs";

const Schema = z.object({
  inputs: z.any()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.parse(body);
  const outputs = await generateOutputs(parsed.inputs as Inputs);
  return NextResponse.json({ outputs });
}
