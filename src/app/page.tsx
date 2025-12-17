import Link from "next/link";
import { Card, CardContent, CardHeader, Button, Pill } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contractor Edge</h1>
          <p className="text-sm text-zinc-600">Estimate → BOM → Proposal PDF. Single-user MVP.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/estimates/new"><Button>New Estimate</Button></Link>
          <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="font-semibold">Day-one features included</div>
            <Pill>Light theme</Pill>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>Estimate wizard asks for ZIP every time.</li>
            <li>GC-grade pricing math (labor + travel + overhead + profit).</li>
            <li>AI-generated Scope / Assumptions / Exclusions / BOM suggestions.</li>
            <li>Safe + fast AHJ guidance & permit checklist links (Option A).</li>
            <li>Export proposal to PDF and BOM to CSV.</li>
          </ul>
          <div className="pt-2 flex gap-2">
            <Link href="/estimates/new"><Button>Build an estimate</Button></Link>
            <Link href="/dashboard"><Button variant="secondary">See dashboard</Button></Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-zinc-500">
        Disclaimer: Code/permit info is best-effort and AHJ-dependent. Always verify with the local building department for the project address.
      </div>
    </div>
  );
}
