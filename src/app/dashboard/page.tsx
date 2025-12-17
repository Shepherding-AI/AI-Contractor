import Link from "next/link";
import { Card, CardContent, CardHeader, Button, Pill } from "@/components/ui";
import { listEstimates } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const items = listEstimates();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Dashboard</h1>
          <p className="text-sm text-zinc-600">Your saved estimates.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/estimates/new"><Button>New Estimate</Button></Link>
          <Link href="/"><Button variant="secondary">Home</Button></Link>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="font-semibold">Estimates</div>
          <Pill>{items.length} total</Pill>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((it: any) => (
              <div key={it.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-xs text-zinc-600">
                    {it.trade} • ZIP {it.zip} • Updated {new Date(it.updated_at).toLocaleString()}
                  </div>
                </div>
                <Link href={`/estimates/${it.id}`}><Button variant="secondary">Open</Button></Link>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-6 text-sm text-zinc-600">
                No estimates yet. Create your first one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
