export type ZipInfo = { city?: string; state?: string; county?: string };

export async function lookupZip(zip: string): Promise<ZipInfo> {
  // Safe+fast MVP: try a free lookup; if it fails, return empty.
  // NOTE: This is best-effort. Actual permit jurisdiction is AHJ-specific.
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`, { cache: "no-store" });
    if (!r.ok) return {};
    const j: any = await r.json();
    const place = j?.places?.[0];
    return {
      city: place?.["place name"],
      state: place?.["state abbreviation"]
    };
  } catch {
    return {};
  }
}

export function buildAhjSearchLinks(zip: string, info: ZipInfo) {
  const qBase = [info.city, info.state, "building department permit"].filter(Boolean).join(" ");
  const qPermits = qBase || `permit office ${zip}`;
  const qInspections = [info.city, info.state, "inspection scheduling"].filter(Boolean).join(" ") || `inspection scheduling ${zip}`;
  const qCodes = [info.city, info.state, "adopted building code"].filter(Boolean).join(" ") || `adopted building code ${zip}`;

  const make = (label: string, q: string) => ({
    label,
    url: `https://www.google.com/search?q=${encodeURIComponent(q)}`
  });

  return [
    make("Find local Building Department (AHJ)", qPermits),
    make("Permit applications & fees", qPermits + " application fee"),
    make("Inspection scheduling", qInspections),
    make("Adopted codes (best-effort)", qCodes)
  ];
}
