export type Trade =
  | "Residential Remodel GC"
  | "HVAC"
  | "Electrical"
  | "Plumbing"
  | "Decks/Fencing"
  | "Concrete"
  | "Other";

export type Customer = {
  name: string;
  phone?: string;
  email?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
};

export type LineItem = {
  name: string;
  unit?: string;
  qty: number;
  unitCost?: number; // optional in V1
  notes?: string;
};

export type PricingMode = "markup" | "margin";

export type Inputs = {
  trade: Trade;
  zip: string;
  jobTitle: string;

  jobDescription: string;
  constraints: string;
  inclusions: string;
  exclusions: string;

  labor: {
    mode: "hourly" | "crew";
    hourlyRate: number; // burdened
    crewDayRate: number;
    estimatedHours: number;
    estimatedDays: number;
    crewSize: number;
  };

  travel: {
    driveHoursRoundTrip: number;
    mileageRoundTrip: number;
    trips: number;
    hotelNights: number;
    perDiemPerPersonPerDay: number;
    people: number;
  };

  overhead: {
    mode: "percent" | "per_day" | "blended";
    percent: number;
    perDay: number;
    blendedBurdenPercent: number;
  };

  profit: {
    mode: PricingMode;
    target: number; // percent
  };

  materials: {
    wastePercentDefault: number;
    items: LineItem[];
  };

  schedule: {
    startWindow: string;
    durationDays: number;
  };
};

export type Outputs = {
  totals: {
    laborCost: number;
    travelCost: number;
    materialsCost: number;
    overheadCost: number;
    subtotalCost: number;
    profit: number;
    price: number;
    margin: number; // computed
  };
  scopeOfWork: string;
  assumptions: string[];
  exclusions: string[];
  bom: Array<{ name: string; qty: number; unit?: string; notes?: string }>;
  ahj: {
    locationGuess: { city?: string; state?: string; county?: string };
    guidance: string[];
    searchLinks: Array<{ label: string; url: string }>;
  };
};
