import OpenAI from "openai";
import { Inputs, Outputs } from "@/lib/types";
import { computeTotals } from "@/lib/pricing";
import { buildAhjSearchLinks, lookupZip } from "@/lib/zip";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function systemPrompt() {
  return [
    "You are a veteran US-based General Contractor and estimator with deep knowledge across trades (GC remodel, HVAC, electrical, plumbing, decks/fencing, concrete).",
    "Your job is to produce practical, contractor-grade deliverables: estimate narrative, scope of work, assumptions, exclusions, and a build-of-materials suggestion list.",
    "You must ALWAYS ask for ZIP code and treat code guidance as AHJ-dependent. Provide safe reminders, inspection/permit checklists, and 'verify with AHJ' disclaimers.",
    "Be concise, action-oriented, and prioritize profitability and risk control (change orders, allowances, exclusions).",
    "Never claim certainty about code requirements; present as best-effort guidance and next steps."
  ].join("\n");
}

export async function generateOutputs(inputs: Inputs): Promise<Outputs> {
  const totals = computeTotals(inputs);
  const zipInfo = await lookupZip(inputs.zip);
  const links = buildAhjSearchLinks(inputs.zip, zipInfo);

  const client = getOpenAIClient();

  const prompt = {
    inputs,
    computedTotals: totals,
    zipInfo,
    requiredBehavior: {
      include: [
        "scopeOfWork (well-formatted paragraphs + bullets)",
        "assumptions (bullet list, 6-12 items)",
        "exclusions (bullet list, 6-12 items)",
        "bom (materials suggestions list with qty + unit when possible, based on description and trade)",
        "ahjGuidance (permit/code reminders based on trade, expressed as checklists)"
      ]
    }
  };

  const schemaHint = `Return JSON ONLY with keys: scopeOfWork (string), assumptions (string[]), exclusions (string[]), bom ({name:string,qty:number,unit?:string,notes?:string}[]), ahjGuidance (string[]).`;

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt() },
      { role: "user", content: `${schemaHint}\n\nProject details:\n${JSON.stringify(prompt, null, 2)}` }
    ]
  });

  const text = resp.choices?.[0]?.message?.content ?? "";
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // attempt to extract JSON
    const m = text.match(/\{[\s\S]*\}$/);
    if (m) parsed = JSON.parse(m[0]);
    else throw new Error("AI did not return valid JSON.");
  }

  return {
    totals,
    scopeOfWork: String(parsed.scopeOfWork ?? ""),
    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map(String) : [],
    exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions.map(String) : [],
    bom: Array.isArray(parsed.bom) ? parsed.bom.map((x: any) => ({
      name: String(x.name ?? ""),
      qty: Number(x.qty ?? 0),
      unit: x.unit ? String(x.unit) : undefined,
      notes: x.notes ? String(x.notes) : undefined
    })) : [],
    ahj: {
      locationGuess: zipInfo,
      guidance: Array.isArray(parsed.ahjGuidance) ? parsed.ahjGuidance.map(String) : [],
      searchLinks: links
    }
  };
}
