"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, Button, Input, Label, Textarea, Pill } from "@/components/ui";
import { Trade, Inputs, Outputs, Customer } from "@/lib/types";
import Link from "next/link";

function uid() {
  return "est_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const trades: Trade[] = ["Residential Remodel GC", "HVAC", "Electrical", "Plumbing", "Decks/Fencing", "Concrete", "Other"];

const defaultInputs = (): Inputs => ({
  trade: "Residential Remodel GC",
  zip: "",
  jobTitle: "Estimate",
  jobDescription: "",
  constraints: "",
  inclusions: "",
  exclusions: "",
  labor: {
    mode: "hourly",
    hourlyRate: 85,
    crewDayRate: 900,
    estimatedHours: 16,
    estimatedDays: 2,
    crewSize: 2
  },
  travel: {
    driveHoursRoundTrip: 0,
    mileageRoundTrip: 0,
    trips: 1,
    hotelNights: 0,
    perDiemPerPersonPerDay: 0,
    people: 2
  },
  overhead: {
    mode: "percent",
    percent: 12,
    perDay: 250,
    blendedBurdenPercent: 18
  },
  profit: {
    mode: "margin",
    target: 25
  },
  materials: {
    wastePercentDefault: 10,
    items: [
      { name: "Example material line item (edit/remove)", unit: "ea", qty: 1, unitCost: 0, notes: "" }
    ]
  },
  schedule: {
    startWindow: "Within 2-3 weeks",
    durationDays: 2
  }
});

const defaultCustomer = (): Customer => ({
  name: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: ""
});

export default function NewEstimate() {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inputs, setInputs] = useState<Inputs>(defaultInputs());
  const [customer, setCustomer] = useState<Customer>(defaultCustomer());
  const [outputs, setOutputs] = useState<Outputs | null>(null);

  const canNext = useMemo(() => {
    if (step === 1) return inputs.zip.trim().length >= 5 && inputs.jobTitle.trim().length > 0;
    if (step === 2) return customer.name.trim().length > 0 && customer.address1.trim().length > 0 && customer.city.trim().length > 0 && customer.state.trim().length > 0;
    if (step === 3) return inputs.jobDescription.trim().length > 20;
    return true;
  }, [step, inputs, customer]);

  const addItem = () => {
    setInputs(prev => ({
      ...prev,
      materials: { ...prev.materials, items: [...prev.materials.items, { name: "", unit: "ea", qty: 1, unitCost: 0, notes: "" }] }
    }));
  };

  const removeItem = (idx: number) => {
    setInputs(prev => ({
      ...prev,
      materials: { ...prev.materials, items: prev.materials.items.filter((_, i) => i !== idx) }
    }));
  };

  async function runAI() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: { ...inputs, zip: inputs.zip.trim(), trade: inputs.trade } })
      });
      if (!r.ok) throw new Error("AI generate failed");
      const j = await r.json();
      setOutputs(j.outputs);
      setStep(5);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!outputs) return;
    setBusy(true);
    setError(null);
    const id = uid();
    try {
      const payload = {
        id,
        title: inputs.jobTitle,
        zip: inputs.zip,
        trade: inputs.trade,
        customer_json: JSON.stringify(customer),
        inputs_json: JSON.stringify(inputs),
        outputs_json: JSON.stringify(outputs)
      };
      const r = await fetch("/api/estimates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("Save failed");
      window.location.href = `/estimates/${id}`;
    } catch (e: any) {
      setError(e?.message || "Save failed.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Estimate</h1>
          <p className="text-sm text-zinc-600">Wizard style: gather details → run AI → export.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
          <Link href="/"><Button variant="ghost">Home</Button></Link>
        </div>
      </header>

      <div className="flex gap-2 flex-wrap">
        {[1,2,3,4,5].map(n => (
          <Pill key={n} className={n===step ? "bg-black text-white border-black" : ""}>Step {n}</Pill>
        ))}
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}

      {step === 1 && (
        <Card>
          <CardHeader><div className="font-semibold">1) Basics (ZIP required)</div></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Trade</Label>
                <select className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm" value={inputs.trade}
                  onChange={e => setInputs(prev => ({...prev, trade: e.target.value as Trade}))}>
                  {trades.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={inputs.jobTitle} onChange={e => setInputs(prev => ({...prev, jobTitle: e.target.value}))} />
              </div>
              <div>
                <Label>Project ZIP (always)</Label>
                <Input value={inputs.zip} onChange={e => setInputs(prev => ({...prev, zip: e.target.value}))} placeholder="e.g., 64081" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button disabled={!canNext} onClick={() => setStep(2)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><div className="font-semibold">2) Customer + Address</div></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Customer Name</Label>
                <Input value={customer.name} onChange={e => setCustomer(p => ({...p, name: e.target.value}))} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={customer.phone || ""} onChange={e => setCustomer(p => ({...p, phone: e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <Label>Address Line 1</Label>
                <Input value={customer.address1} onChange={e => setCustomer(p => ({...p, address1: e.target.value}))} />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input value={customer.address2 || ""} onChange={e => setCustomer(p => ({...p, address2: e.target.value}))} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={customer.city} onChange={e => setCustomer(p => ({...p, city: e.target.value}))} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={customer.state} onChange={e => setCustomer(p => ({...p, state: e.target.value}))} />
              </div>
              <div>
                <Label>ZIP</Label>
                <Input value={customer.zip} onChange={e => setCustomer(p => ({...p, zip: e.target.value}))} />
              </div>
              <div className="md:col-span-3">
                <Label>Email</Label>
                <Input value={customer.email || ""} onChange={e => setCustomer(p => ({...p, email: e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!canNext} onClick={() => setStep(3)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><div className="font-semibold">3) Job Details</div></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Job Description (be specific)</Label>
              <Textarea value={inputs.jobDescription} onChange={e => setInputs(p => ({...p, jobDescription: e.target.value}))}
                placeholder="Describe exactly what you're doing, where, and what quality level." />
              <div className="text-xs text-zinc-500 mt-1">Tip: include size, materials, demo, disposal, access constraints, and finish level.</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Constraints / Risks</Label>
                <Textarea value={inputs.constraints} onChange={e => setInputs(p => ({...p, constraints: e.target.value}))} placeholder="Schedule, access, weather, HOA, unknowns..." />
              </div>
              <div>
                <Label>Inclusions</Label>
                <Textarea value={inputs.inclusions} onChange={e => setInputs(p => ({...p, inclusions: e.target.value}))} placeholder="What's included in your number?" />
              </div>
              <div>
                <Label>Exclusions (known)</Label>
                <Textarea value={inputs.exclusions} onChange={e => setInputs(p => ({...p, exclusions: e.target.value}))} placeholder="What's excluded or allowance-based?" />
              </div>
              <div>
                <Label>Schedule</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={inputs.schedule.startWindow} onChange={e => setInputs(p => ({...p, schedule: {...p.schedule, startWindow: e.target.value}}))} placeholder="Start window" />
                  <Input type="number" value={inputs.schedule.durationDays} onChange={e => setInputs(p => ({...p, schedule: {...p.schedule, durationDays: Number(e.target.value || 0)}}))} placeholder="Duration days" />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button disabled={!canNext} onClick={() => setStep(4)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><div className="font-semibold">4) Pricing Inputs (all options)</div></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="font-semibold">Labor</div>
                <div className="flex gap-2">
                  <Button variant={inputs.labor.mode === "hourly" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, labor: {...p.labor, mode:"hourly"}}))}>Hourly</Button>
                  <Button variant={inputs.labor.mode === "crew" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, labor: {...p.labor, mode:"crew"}}))}>Crew</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Burdened Hourly Rate</Label>
                    <Input type="number" value={inputs.labor.hourlyRate} onChange={e => setInputs(p => ({...p, labor: {...p.labor, hourlyRate: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Crew Day Rate</Label>
                    <Input type="number" value={inputs.labor.crewDayRate} onChange={e => setInputs(p => ({...p, labor: {...p.labor, crewDayRate: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Estimated Hours</Label>
                    <Input type="number" value={inputs.labor.estimatedHours} onChange={e => setInputs(p => ({...p, labor: {...p.labor, estimatedHours: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Estimated Days</Label>
                    <Input type="number" value={inputs.labor.estimatedDays} onChange={e => setInputs(p => ({...p, labor: {...p.labor, estimatedDays: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Crew Size</Label>
                    <Input type="number" value={inputs.labor.crewSize} onChange={e => setInputs(p => ({...p, labor: {...p.labor, crewSize: Number(e.target.value || 0)}}))} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold">Travel</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Drive hrs (round trip)</Label>
                    <Input type="number" value={inputs.travel.driveHoursRoundTrip} onChange={e => setInputs(p => ({...p, travel: {...p.travel, driveHoursRoundTrip: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Miles (round trip)</Label>
                    <Input type="number" value={inputs.travel.mileageRoundTrip} onChange={e => setInputs(p => ({...p, travel: {...p.travel, mileageRoundTrip: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Trips</Label>
                    <Input type="number" value={inputs.travel.trips} onChange={e => setInputs(p => ({...p, travel: {...p.travel, trips: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Hotel nights</Label>
                    <Input type="number" value={inputs.travel.hotelNights} onChange={e => setInputs(p => ({...p, travel: {...p.travel, hotelNights: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Per diem / person / day</Label>
                    <Input type="number" value={inputs.travel.perDiemPerPersonPerDay} onChange={e => setInputs(p => ({...p, travel: {...p.travel, perDiemPerPersonPerDay: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>People</Label>
                    <Input type="number" value={inputs.travel.people} onChange={e => setInputs(p => ({...p, travel: {...p.travel, people: Number(e.target.value || 0)}}))} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold">Overhead</div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant={inputs.overhead.mode === "percent" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, overhead: {...p.overhead, mode:"percent"}}))}>%</Button>
                  <Button variant={inputs.overhead.mode === "per_day" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, overhead: {...p.overhead, mode:"per_day"}}))}>$ / day</Button>
                  <Button variant={inputs.overhead.mode === "blended" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, overhead: {...p.overhead, mode:"blended"}}))}>Blended %</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Overhead %</Label>
                    <Input type="number" value={inputs.overhead.percent} onChange={e => setInputs(p => ({...p, overhead: {...p.overhead, percent: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Overhead $ / day</Label>
                    <Input type="number" value={inputs.overhead.perDay} onChange={e => setInputs(p => ({...p, overhead: {...p.overhead, perDay: Number(e.target.value || 0)}}))} />
                  </div>
                  <div className="col-span-2">
                    <Label>Blended burden %</Label>
                    <Input type="number" value={inputs.overhead.blendedBurdenPercent} onChange={e => setInputs(p => ({...p, overhead: {...p.overhead, blendedBurdenPercent: Number(e.target.value || 0)}}))} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold">Profit</div>
                <div className="flex gap-2">
                  <Button variant={inputs.profit.mode === "margin" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, profit: {...p.profit, mode:"margin"}}))}>Margin</Button>
                  <Button variant={inputs.profit.mode === "markup" ? "primary" : "secondary"} onClick={() => setInputs(p => ({...p, profit: {...p.profit, mode:"markup"}}))}>Markup</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Target %</Label>
                    <Input type="number" value={inputs.profit.target} onChange={e => setInputs(p => ({...p, profit: {...p.profit, target: Number(e.target.value || 0)}}))} />
                  </div>
                  <div>
                    <Label>Waste % default</Label>
                    <Input type="number" value={inputs.materials.wastePercentDefault} onChange={e => setInputs(p => ({...p, materials: {...p.materials, wastePercentDefault: Number(e.target.value || 0)}}))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-semibold">Materials (manual in V1)</div>
              <div className="space-y-3">
                {inputs.materials.items.map((it, idx) => (
                  <div key={idx} className="rounded-2xl border bg-white p-4">
                    <div className="grid md:grid-cols-6 gap-3 items-end">
                      <div className="md:col-span-2">
                        <Label>Item</Label>
                        <Input value={it.name} onChange={e => {
                          const v = e.target.value;
                          setInputs(p => ({...p, materials: {...p.materials, items: p.materials.items.map((x,i)=> i===idx ? {...x, name:v}: x)}}));
                        }} />
                      </div>
                      <div>
                        <Label>Qty</Label>
                        <Input type="number" value={it.qty} onChange={e => {
                          const v = Number(e.target.value || 0);
                          setInputs(p => ({...p, materials: {...p.materials, items: p.materials.items.map((x,i)=> i===idx ? {...x, qty:v}: x)}}));
                        }} />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input value={it.unit || ""} onChange={e => {
                          const v = e.target.value;
                          setInputs(p => ({...p, materials: {...p.materials, items: p.materials.items.map((x,i)=> i===idx ? {...x, unit:v}: x)}}));
                        }} />
                      </div>
                      <div>
                        <Label>Unit Cost (optional)</Label>
                        <Input type="number" value={it.unitCost ?? 0} onChange={e => {
                          const v = Number(e.target.value || 0);
                          setInputs(p => ({...p, materials: {...p.materials, items: p.materials.items.map((x,i)=> i===idx ? {...x, unitCost:v}: x)}}));
                        }} />
                      </div>
                      <div className="flex justify-end">
                        <Button variant="danger" onClick={() => removeItem(idx)}>Remove</Button>
                      </div>
                      <div className="md:col-span-6">
                        <Label>Notes</Label>
                        <Input value={it.notes || ""} onChange={e => {
                          const v = e.target.value;
                          setInputs(p => ({...p, materials: {...p.materials, items: p.materials.items.map((x,i)=> i===idx ? {...x, notes:v}: x)}}));
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" onClick={addItem}>Add material line</Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
              <Button disabled={busy} onClick={runAI}>{busy ? "Running AI..." : "Run AI + Build Estimate"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && outputs && (
        <Card>
          <CardHeader><div className="font-semibold">5) Review + Save</div></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold">Totals</div>
                <div className="text-sm text-zinc-700 mt-2 space-y-1">
                  <div>Labor: ${outputs.totals.laborCost.toFixed(2)}</div>
                  <div>Travel: ${outputs.totals.travelCost.toFixed(2)}</div>
                  <div>Materials: ${outputs.totals.materialsCost.toFixed(2)}</div>
                  <div>Overhead: ${outputs.totals.overheadCost.toFixed(2)}</div>
                  <div className="pt-2 font-semibold">Price: ${outputs.totals.price.toFixed(2)} ({outputs.totals.margin.toFixed(1)}% margin)</div>
                </div>
              </div>
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold">AHJ / Permit Links (best-effort)</div>
                <div className="text-sm text-zinc-700 mt-2 space-y-2">
                  {outputs.ahj.searchLinks.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" className="underline">{l.label}</a>
                  ))}
                  <div className="text-xs text-zinc-500">Always verify with the local building department for the exact address.</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold">Scope of Work</div>
                <div className="text-sm text-zinc-700 mt-2 whitespace-pre-wrap">{outputs.scopeOfWork}</div>
              </div>
              <div className="rounded-2xl border p-4 bg-white space-y-3">
                <div>
                  <div className="font-semibold">Assumptions</div>
                  <ul className="list-disc pl-5 text-sm text-zinc-700 mt-2 space-y-1">
                    {outputs.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold">Exclusions</div>
                  <ul className="list-disc pl-5 text-sm text-zinc-700 mt-2 space-y-1">
                    {outputs.exclusions.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 bg-white">
              <div className="font-semibold">BOM Suggestions</div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-zinc-600">
                    <tr>
                      <th className="py-2">Item</th>
                      <th className="py-2">Qty</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {outputs.bom.map((b, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-4">{b.name}</td>
                        <td className="py-2 pr-4">{b.qty}</td>
                        <td className="py-2 pr-4">{b.unit || ""}</td>
                        <td className="py-2">{b.notes || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(4)}>Back</Button>
              <Button disabled={busy} onClick={save}>{busy ? "Saving..." : "Save Estimate"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
