import { Inputs, Outputs } from "@/lib/types";

export function computeTotals(inputs: Inputs): Outputs["totals"] {
  const laborCost =
    inputs.labor.mode === "hourly"
      ? inputs.labor.estimatedHours * inputs.labor.hourlyRate
      : inputs.labor.estimatedDays * inputs.labor.crewDayRate;

  const driveTimeCost = (inputs.travel.driveHoursRoundTrip * inputs.travel.trips) * inputs.labor.hourlyRate; // burdened
  const mileageCost = inputs.travel.mileageRoundTrip * inputs.travel.trips * 0.67; // default IRS-ish heuristic; user can adjust later
  const hotelCost = inputs.travel.hotelNights * 175; // placeholder default
  const perDiem = inputs.travel.perDiemPerPersonPerDay * inputs.travel.people * inputs.travel.hotelNights;

  const travelCost = driveTimeCost + mileageCost + hotelCost + perDiem;

  const materialsBase = inputs.materials.items.reduce((sum, it) => sum + (it.unitCost ?? 0) * it.qty, 0);
  const materialsCost = materialsBase * (1 + (inputs.materials.wastePercentDefault / 100));

  let overheadCost = 0;
  if (inputs.overhead.mode === "percent") {
    overheadCost = (laborCost + travelCost + materialsCost) * (inputs.overhead.percent / 100);
  } else if (inputs.overhead.mode === "per_day") {
    const days = inputs.labor.mode === "crew" ? inputs.labor.estimatedDays : Math.max(1, Math.ceil(inputs.labor.estimatedHours / 8));
    overheadCost = days * inputs.overhead.perDay;
  } else {
    overheadCost = (laborCost + travelCost + materialsCost) * (inputs.overhead.blendedBurdenPercent / 100);
  }

  const subtotalCost = laborCost + travelCost + materialsCost + overheadCost;

  let price = subtotalCost;
  let profit = 0;
  if (inputs.profit.mode === "markup") {
    profit = subtotalCost * (inputs.profit.target / 100);
    price = subtotalCost + profit;
  } else {
    // margin: price = cost / (1 - m)
    const m = inputs.profit.target / 100;
    price = m >= 0.95 ? subtotalCost * 20 : subtotalCost / (1 - m);
    profit = price - subtotalCost;
  }
  const margin = price <= 0 ? 0 : (profit / price) * 100;

  return { laborCost, travelCost, materialsCost, overheadCost, subtotalCost, profit, price, margin };
}
