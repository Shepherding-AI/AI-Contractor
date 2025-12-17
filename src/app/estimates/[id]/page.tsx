import Link from "next/link";
import { Card, CardContent, CardHeader, Button, Pill } from "@/components/ui";
import { getEstimate } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EstimatePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = getEstimate(id);

  if (!row) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-zinc-700">Estimate not found.</div>
        <Link href="/dashboard"><Button>Back to dashboard</Button></Link>
      </div>
    );
  }

  const customer = JSON.parse(row.customer_json);
  const outputs = JSON.parse(row.outputs_json);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{row.title}</h1>
          <p className="text-sm text-zinc-600">{row.trade} • ZIP {row.zip}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/export/pdf/${row.id}`}><Button>Export PDF</Button></a>
          <a href={`/api/export/bom/${row.id}`}><Button variant="secondary">Export BOM CSV</Button></a>
          <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="font-semibold">Customer</div>
            <Pill>Saved</Pill>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-1">
            <div className="font-semibold">{customer.name}</div>
            <div>{customer.address1}{customer.address2 ? `, ${customer.address2}` : ""}</div>
            <div>{customer.city}, {customer.state} {customer.zip}</div>
            {(customer.phone || customer.email) && <div className="pt-2">{customer.phone} {customer.email ? `• ${customer.email}` : ""}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="font-semibold">Price</div></CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-1">
            <div>Labor: ${outputs.totals.laborCost.toFixed(2)}</div>
            <div>Travel: ${outputs.totals.travelCost.toFixed(2)}</div>
            <div>Materials: ${outputs.totals.materialsCost.toFixed(2)}</div>
            <div>Overhead: ${outputs.totals.overheadCost.toFixed(2)}</div>
            <div className="pt-2 font-semibold">Total: ${outputs.totals.price.toFixed(2)}</div>
            <div className="text-xs text-zinc-500">Margin: {outputs.totals.margin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><div className="font-semibold">Scope of Work</div></CardHeader>
        <CardContent className="text-sm text-zinc-700 whitespace-pre-wrap">{outputs.scopeOfWork}</CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><div className="font-semibold">Assumptions</div></CardHeader>
          <CardContent className="text-sm text-zinc-700">
            <ul className="list-disc pl-5 space-y-1">
              {(outputs.assumptions || []).map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="font-semibold">Exclusions</div></CardHeader>
          <CardContent className="text-sm text-zinc-700">
            <ul className="list-disc pl-5 space-y-1">
              {(outputs.exclusions || []).map((e: string, i: number) => <li key={i}>{e}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><div className="font-semibold">BOM Suggestions</div></CardHeader>
        <CardContent className="overflow-x-auto">
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
              {(outputs.bom || []).map((b: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 pr-4">{b.name}</td>
                  <td className="py-2 pr-4">{b.qty}</td>
                  <td className="py-2 pr-4">{b.unit || ""}</td>
                  <td className="py-2">{b.notes || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="font-semibold">Permit / Code Guidance (Option A: safe + fast)</div></CardHeader>
        <CardContent className="text-sm text-zinc-700 space-y-3">
          <div className="space-y-1">
            {(outputs.ahj?.guidance || []).map((g: string, i: number) => <div key={i}>• {g}</div>)}
          </div>
          <div className="pt-2">
            <div className="font-semibold">Quick links</div>
            <div className="flex flex-col gap-1 mt-1">
              {(outputs.ahj?.searchLinks || []).map((l: any, i: number) => (
                <a key={i} className="underline" href={l.url} target="_blank">{l.label}</a>
              ))}
            </div>
          </div>
          <div className="text-xs text-zinc-500">Always verify requirements with the local building department for the exact job address (AHJ).</div>
        </CardContent>
      </Card>
    </div>
  );
}
