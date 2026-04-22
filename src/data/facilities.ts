// 12-month indicator history per facility, plus computed current values.
// Months ordered chronologically: index 0 = 12 months ago, index 11 = current month (Oct 2025).

export type StockStatus = "full" | "partial" | "low";
export type Status = "action_needed" | "at_risk" | "on_target";
export type TemporalLabel =
  | "new_drop"
  | "persistent"
  | "stagnating"
  | "anomaly"
  | "recovering"
  | "stable";

export interface FacilityHistory {
  bpControlled: number[];        // %
  bpUncontrolled: number[];      // %
  dmControlled: number[];        // %
  dmUncontrolled: number[];      // %
  htnNoVisit3m: number[];        // %
  htnNoVisit12m: number[];       // %
  dmNoVisit3m: number[];         // %
  dmNoVisit12m: number[];        // %
  titration: number[];           // %
  statin: number[];              // %
  fudging: number[];             // %
  stock: StockStatus[];          // monthly stock status
}

export interface Facility {
  id: string;
  name: string;
  upazila: string;
  patients: number;
  history: FacilityHistory;
  // Author-curated narrative pieces — the AI insight engine in production
  // would generate these; here they are pre-baked from the same data.
  insights: { headline: string; detail: string; basis: string[] }[];
  investigations: { step: string; tests: string }[];
  improvingPractice?: string; // for "wins worth replicating"
  monthsFlagged: number;      // consecutive months currently flagged (0 if not)
  isNew?: boolean;            // newly flagged this month
  fieldContext?: string;      // pre-existing manager-logged context
}

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
export const MONTH_LABELS = MONTHS;
export const CURRENT_MONTH_LABEL = "October 2025";
export const BP_GOAL = 63;

// Helper to build a series with a target current value and a baseline
function series(baseline: number, current: number, opts: { volatility?: number; trend?: number; spike?: { at: number; to: number }[] } = {}): number[] {
  const { volatility = 1.5, trend = 0, spike = [] } = opts;
  const arr: number[] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const v = baseline + (current - baseline) * t + trend * (i - 5.5) + (Math.sin(i * 1.3) * volatility);
    arr.push(Math.max(0, Math.min(100, Math.round(v * 10) / 10)));
  }
  arr[11] = current;
  for (const s of spike) arr[s.at] = s.to;
  return arr;
}

function flat(value: number, jitter = 1): number[] {
  return Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round((value + (Math.sin(i * 1.7) * jitter)) * 10) / 10));
}

function stockSeries(current: StockStatus, history: Partial<Record<number, StockStatus>> = {}): StockStatus[] {
  const arr: StockStatus[] = Array(12).fill("full");
  Object.entries(history).forEach(([k, v]) => { arr[Number(k)] = v!; });
  arr[11] = current;
  return arr;
}

export const FACILITIES: Facility[] = [
  // ============ PERSISTENT — Osmaninagar (high fudging, stagnating) ============
  {
    id: "osmaninagar",
    name: "Osmaninagar UHC",
    upazila: "Osmaninagar",
    patients: 1840,
    monthsFlagged: 3,
    history: {
      bpControlled: series(48, 46, { volatility: 0.8, trend: -0.2 }),
      bpUncontrolled: series(22, 24, { volatility: 0.6 }),
      dmControlled: series(40, 38),
      dmUncontrolled: series(28, 30),
      htnNoVisit3m: series(34, 36, { volatility: 1 }),
      htnNoVisit12m: series(18, 19),
      dmNoVisit3m: series(36, 38),
      dmNoVisit12m: series(20, 22),
      titration: series(30, 27, { trend: -0.3 }),
      statin: series(38, 40),
      fudging: series(14, 18, { trend: 0.4 }),
      stock: stockSeries("full"),
    },
    insights: [
      {
        headline: "High fudging undermines the headline number",
        detail: "Fudging has risen from 14% to 18% over 3 months. The reported 46% BP control likely overstates true control. Until measurement is verified, treat the BP figure as unreliable.",
        basis: ["BP fudging rate (12-mo trend)", "BP controlled %"],
      },
      {
        headline: "Treatment inertia is worsening, not holding",
        detail: "Titration has slipped from 30% to 27% — meds are being adjusted for fewer than 1 in 4 uncontrolled patients despite full drug stock.",
        basis: ["Titration rate (3-mo trend)", "Drug stock status", "BP uncontrolled %"],
      },
      {
        headline: "Flagged 3 months — previous approach is not working",
        detail: "This facility was flagged for the same combination in Aug and Sep. The MO conversations attempted in Sep have not shifted any indicator. A different intervention is required.",
        basis: ["monthsFlagged", "titration", "fudging"],
      },
    ],
    investigations: [
      { step: "Audit 20 BP readings from the past week for clustering at 130/80, 120/80, 138/88.", tests: "Fudging" },
      { step: "Pull the 15 most recent uncontrolled patients; check whether meds were changed at last visit.", tests: "Titration" },
      { step: "Decide on a different intervention than MO conversation — on-site mentoring, BP cuff recalibration, or supervisory visit.", tests: "Stagnation response" },
    ],
  },

  // ============ PERSISTENT — Kacuya Bohor (with field context) ============
  {
    id: "kacuya-bohor",
    name: "Kacuya Bohor CC",
    upazila: "Bishwanath",
    patients: 142,
    monthsFlagged: 4,
    fieldContext: "Known supply chain disruption since July — Amlodipine 5mg out of stock, alternative supplier engaged in Sep but deliveries inconsistent. Status reviewed with DGHS 8-Oct.",
    history: {
      bpControlled: series(58, 41, { volatility: 1, trend: -1.2 }),
      bpUncontrolled: series(18, 32, { trend: 1 }),
      dmControlled: series(42, 35),
      dmUncontrolled: series(28, 36),
      htnNoVisit3m: series(22, 38, { trend: 1.2 }),
      htnNoVisit12m: series(15, 24),
      dmNoVisit3m: series(24, 40),
      dmNoVisit12m: series(16, 26),
      titration: series(48, 44, { volatility: 1 }),
      statin: series(45, 47),
      fudging: flat(6, 0.5),
      stock: stockSeries("low", { 7: "partial", 8: "low", 9: "low", 10: "partial" }),
    },
    insights: [
      {
        headline: "Drug stock — known issue, deprioritize as a finding",
        detail: "Amlodipine has been low or partial since July. Field context is logged. The decline in BP control and rise in missed visits track the stock timeline; until supply normalises, no on-site investigation will change the data.",
        basis: ["Drug stock (4-mo)", "BP controlled trend", "field context"],
      },
      {
        headline: "Verify next month rather than this month",
        detail: "Defer a visit. Re-check when November stock arrives — if missed visits don't recover within one cycle of stable supply, escalate beyond stock.",
        basis: ["fieldContext", "htnNoVisit3m"],
      },
    ],
    investigations: [
      { step: "Confirm alternative supplier delivery arrived in week of 14-Oct.", tests: "Stock" },
      { step: "If delivered: defer visit. If not: escalate to district pharmacist, not facility.", tests: "Stock" },
    ],
  },

  // ============ PERSISTENT — Lamagangapur (2 months, escalating) ============
  {
    id: "lamagangapur",
    name: "Lamagangapur CC",
    upazila: "Balaganj",
    patients: 218,
    monthsFlagged: 2,
    history: {
      bpControlled: series(56, 44, { trend: -0.9 }),
      bpUncontrolled: series(20, 28),
      dmControlled: series(44, 38),
      dmUncontrolled: series(26, 32),
      htnNoVisit3m: series(28, 32),
      htnNoVisit12m: series(16, 18),
      dmNoVisit3m: series(30, 34),
      dmNoVisit12m: series(18, 20),
      titration: series(35, 28, { trend: -0.8 }),
      statin: series(40, 38),
      fudging: flat(7, 0.5),
      stock: stockSeries("full"),
    },
    insights: [
      {
        headline: "Treatment inertia — not stock, not measurement",
        detail: "Drug stock is full, fudging is steady at 7%. The driver is titration: down from 35% to 28% across two months while uncontrolled patients rose to 28%.",
        basis: ["Titration (2-mo)", "Drug stock", "Fudging"],
      },
      {
        headline: "Second consecutive month — intervene before it becomes structural",
        detail: "Flagged in Sep with the same titration signal. Earlier than Osmaninagar in the persistence cycle — direct MO feedback may still work here.",
        basis: ["monthsFlagged", "titration trend"],
      },
    ],
    investigations: [
      { step: "Pull 10 uncontrolled patients; verify meds were not adjusted at last visit.", tests: "Titration" },
      { step: "Discuss titration protocol with attending MO.", tests: "Titration" },
    ],
  },

  // ============ ANOMALY — Chhatrish (sudden BP drop) ============
  {
    id: "chhatrish",
    name: "Chhatrish CC",
    upazila: "Golapganj",
    patients: 312,
    monthsFlagged: 1,
    isNew: true,
    history: {
      bpControlled: [60, 58, 61, 59, 57, 62, 58, 60, 59, 57, 58, 40],
      bpUncontrolled: [16, 18, 15, 17, 19, 14, 18, 16, 17, 19, 18, 34],
      dmControlled: flat(48),
      dmUncontrolled: flat(26),
      htnNoVisit3m: flat(24),
      htnNoVisit12m: flat(14),
      dmNoVisit3m: flat(26),
      dmNoVisit12m: flat(16),
      titration: [42, 44, 41, 43, 45, 42, 44, 43, 42, 41, 43, 22],
      statin: flat(48),
      fudging: flat(6),
      stock: stockSeries("partial", { 10: "full" }),
    },
    insights: [
      {
        headline: "Sudden one-month drop — anomaly, not trend",
        detail: "BP control fell to 40% from a 6-month average of 59%. Titration collapsed in the same month from 43% to 22%. Stock dropped from full to partial. Something specific happened in Oct.",
        basis: ["BP controlled (1 vs 6-mo avg)", "Titration delta", "Stock change"],
      },
      {
        headline: "Verify before concluding",
        detail: "Single-month anomalies sometimes self-correct. Confirm whether (a) a key MO was absent, (b) Amlodipine ran out mid-month, or (c) a measurement-batch issue occurred.",
        basis: ["historical baseline"],
      },
    ],
    investigations: [
      { step: "Check staff roster for Oct — was the lead MO absent?", tests: "Anomaly cause" },
      { step: "Pull pharmacy register for week of 7-Oct — when did Amlodipine partial-stock begin?", tests: "Stock" },
      { step: "Sample 15 readings across Oct; confirm they aren't from a single day or single MO.", tests: "Measurement" },
    ],
  },

  // ============ ANOMALY — Beanibazar (sudden missed-visits spike) ============
  {
    id: "beanibazar",
    name: "Beanibazar UHC",
    upazila: "Beanibazar",
    patients: 1605,
    monthsFlagged: 1,
    isNew: true,
    history: {
      bpControlled: [62, 64, 63, 61, 65, 64, 63, 62, 64, 63, 65, 60],
      bpUncontrolled: flat(15),
      dmControlled: flat(50),
      dmUncontrolled: flat(24),
      htnNoVisit3m: [20, 22, 19, 21, 20, 22, 19, 21, 20, 22, 21, 42],
      htnNoVisit12m: flat(14, 0.5),
      dmNoVisit3m: [22, 24, 21, 23, 22, 24, 21, 23, 22, 24, 23, 44],
      dmNoVisit12m: flat(16, 0.5),
      titration: flat(42),
      statin: flat(50),
      fudging: flat(5),
      stock: stockSeries("full"),
    },
    insights: [
      {
        headline: "Missed visits doubled in one month",
        detail: "HTN missed-3m jumped from a 6-month average of 21% to 42%. BP control held, stock is full. This points to an event-level cause: outreach team change, transport disruption, or call-list breakdown.",
        basis: ["htnNoVisit3m (1 vs 6-mo avg)", "Stock", "BP controlled"],
      },
      {
        headline: "Large facility — district-level impact",
        detail: "1,605 patients. A 21pp jump means roughly 340 additional overdue patients this month.",
        basis: ["patients", "htnNoVisit3m delta"],
      },
    ],
    investigations: [
      { step: "Confirm overdue-call list was generated and dialed in Oct.", tests: "Follow-up system" },
      { step: "Check whether community health worker(s) were reassigned this month.", tests: "Staffing" },
    ],
  },

  // ============ RECOVERY — Beanibari (was flagged, now improving) ============
  {
    id: "beanibari",
    name: "Beanibari CC",
    upazila: "Bishwanath",
    patients: 264,
    monthsFlagged: 0,
    history: {
      bpControlled: [55, 53, 51, 49, 47, 46, 45, 48, 52, 56, 60, 64],
      bpUncontrolled: [22, 24, 26, 28, 29, 30, 31, 28, 24, 20, 17, 14],
      dmControlled: flat(50, 1),
      dmUncontrolled: flat(24, 1),
      htnNoVisit3m: [32, 34, 35, 33, 31, 30, 28, 26, 24, 22, 21, 20],
      htnNoVisit12m: flat(15),
      dmNoVisit3m: flat(24),
      dmNoVisit12m: flat(16),
      titration: [30, 31, 32, 33, 34, 36, 38, 41, 44, 46, 48, 50],
      statin: [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
      fudging: flat(6),
      stock: stockSeries("full"),
    },
    insights: [
      {
        headline: "Recovery confirmed — pattern resolving",
        detail: "Flagged in Jul–Aug for low BP control. Three consecutive months of improvement; BP control now 64%, above goal. Titration push appears to be working.",
        basis: ["BP controlled (3-mo trend)", "Titration (6-mo trend)"],
      },
    ],
    investigations: [
      { step: "Light-touch: confirm what changed and document for replication.", tests: "Practice capture" },
    ],
    improvingPractice: "Weekly MO huddle reviewing every uncontrolled patient — adopted in July, sustained.",
  },

  // ============ IMPROVING (replicable) — Gungadiya ============
  {
    id: "gungadiya",
    name: "Gungadiya CC",
    upazila: "Sylhet Sadar",
    patients: 198,
    monthsFlagged: 0,
    history: {
      bpControlled: [60, 61, 62, 63, 64, 65, 66, 67, 68, 70, 71, 73],
      bpUncontrolled: flat(12),
      dmControlled: flat(54),
      dmUncontrolled: flat(20),
      htnNoVisit3m: [26, 25, 24, 22, 20, 18, 17, 16, 15, 14, 13, 12],
      htnNoVisit12m: flat(10),
      dmNoVisit3m: flat(16),
      dmNoVisit12m: flat(12),
      titration: flat(52),
      statin: flat(56),
      fudging: flat(4),
      stock: stockSeries("full"),
    },
    insights: [
      {
        headline: "On target and still climbing",
        detail: "BP control improved 2pp this month to 73%. Missed visits halved over six months. Honest data (fudging 4%).",
        basis: ["BP controlled trend", "htnNoVisit3m (6-mo)"],
      },
    ],
    investigations: [
      { step: "Document overdue-call practice and circulate to flagged facilities.", tests: "Practice capture" },
    ],
    improvingPractice: "Med-reminder SMS sent the morning of every overdue call — pickup rate ~62%.",
  },

  // ============ IMPROVING — Paton ============
  {
    id: "paton",
    name: "Paton CC",
    upazila: "Fenchuganj",
    patients: 176,
    monthsFlagged: 0,
    history: {
      bpControlled: [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 70],
      bpUncontrolled: flat(13),
      dmControlled: flat(52),
      dmUncontrolled: flat(22),
      htnNoVisit3m: flat(18),
      htnNoVisit12m: flat(11),
      dmNoVisit3m: flat(20),
      dmNoVisit12m: flat(13),
      titration: [40, 42, 44, 47, 49, 52, 55, 58, 60, 62, 64, 66],
      statin: flat(54),
      fudging: flat(5),
      stock: stockSeries("full"),
    },
    insights: [
      { headline: "Titration push is paying off", detail: "Titration rose from 40% to 66% over the year. BP control followed, now 70%.", basis: ["Titration (12-mo)", "BP controlled"] },
    ],
    investigations: [{ step: "Document MO titration protocol; share at next district meeting.", tests: "Practice capture" }],
    improvingPractice: "MO uses standing order to titrate at every visit if BP ≥140/90 — no second appointment required.",
  },

  // ============ IMPROVING — Rajnagor ============
  {
    id: "rajnagor",
    name: "Rajnagor CC",
    upazila: "Rajnagor",
    patients: 232,
    monthsFlagged: 0,
    history: {
      bpControlled: [62, 63, 63, 64, 64, 65, 66, 67, 68, 69, 70, 72],
      bpUncontrolled: flat(13),
      dmControlled: flat(56),
      dmUncontrolled: flat(20),
      htnNoVisit3m: [28, 26, 24, 22, 20, 18, 17, 16, 15, 14, 13, 12],
      htnNoVisit12m: flat(10),
      dmNoVisit3m: flat(16),
      dmNoVisit12m: flat(12),
      titration: flat(50),
      statin: flat(58),
      fudging: flat(5),
      stock: stockSeries("full"),
    },
    insights: [
      { headline: "Community outreach is moving the retention needle", detail: "Missed visits dropped 16pp over the year. BP control improved 2pp this month to 72%.", basis: ["htnNoVisit3m (12-mo)", "BP controlled delta"] },
    ],
    investigations: [{ step: "Capture outreach script and broadcast schedule for replication.", tests: "Practice capture" }],
    improvingPractice: "Weekly community radio segment on hypertension medication adherence.",
  },

  // ============ AT RISK — Sylhet Sadar (large facility, moderate underperformance) ============
  {
    id: "sylhet-sadar",
    name: "Sylhet Sadar Hospital",
    upazila: "Sylhet Sadar",
    patients: 5252,
    monthsFlagged: 1,
    isNew: true,
    history: {
      bpControlled: [56, 55, 56, 57, 56, 55, 56, 57, 56, 55, 54, 52],
      bpUncontrolled: flat(20),
      dmControlled: flat(46),
      dmUncontrolled: flat(26),
      htnNoVisit3m: flat(28),
      htnNoVisit12m: flat(17),
      dmNoVisit3m: flat(30),
      dmNoVisit12m: flat(18),
      titration: [38, 38, 37, 38, 37, 38, 37, 38, 37, 36, 35, 34],
      statin: flat(46),
      fudging: flat(7),
      stock: stockSeries("full"),
    },
    insights: [
      {
        headline: "Moderate slip — but 5,252 patients amplifies impact",
        detail: "BP control slipped from 54% to 52%. At this volume, a 1pp district-level shift comes from this facility alone.",
        basis: ["BP controlled delta", "patients"],
      },
      {
        headline: "Titration is drifting downward",
        detail: "Slow 4pp decline over six months. Not yet flagged as persistent; address now to prevent it.",
        basis: ["Titration (6-mo trend)"],
      },
    ],
    investigations: [
      { step: "MO huddle: review titration protocol given patient volume.", tests: "Titration" },
      { step: "Sample 25 uncontrolled patients across both MO clinics.", tests: "Titration" },
    ],
  },

  // ============ UHC Bishwanath — at risk, partial stock ============
  {
    id: "uhc-bishwanath",
    name: "UHC Bishwanath",
    upazila: "Bishwanath",
    patients: 3195,
    monthsFlagged: 1,
    isNew: true,
    history: {
      bpControlled: series(58, 50, { trend: -0.5 }),
      bpUncontrolled: series(18, 24),
      dmControlled: flat(48),
      dmUncontrolled: flat(26),
      htnNoVisit3m: series(26, 32),
      htnNoVisit12m: flat(16),
      dmNoVisit3m: flat(28),
      dmNoVisit12m: flat(17),
      titration: flat(40),
      statin: flat(46),
      fudging: flat(8),
      stock: stockSeries("partial", { 9: "full", 10: "partial" }),
    },
    insights: [
      {
        headline: "Partial stock is the leading hypothesis",
        detail: "Partial stock for 2 of last 3 months. BP control fell 8pp; missed visits up 6pp. Titration is steady — pointing to stock, not clinical practice.",
        basis: ["Stock (3-mo)", "BP controlled trend", "Titration"],
      },
    ],
    investigations: [
      { step: "Check pharmacy register: which drug class is partial?", tests: "Stock" },
      { step: "Verify whether patients were sent home without medication.", tests: "Stock" },
    ],
  },

  // ============ On-target facilities ============
  ...["Tarapur", "Kalighat", "Mirpur", "Akhalia", "Shibganj", "Tultikar", "Nayagaon", "Khasdobir", "Madhabpur"].map((n, i): Facility => ({
    id: n.toLowerCase(),
    name: `${n} CC`,
    upazila: ["Sylhet Sadar", "Bishwanath", "Balaganj", "Golapganj", "Beanibazar", "Fenchuganj", "Rajnagor", "Osmaninagar", "Sylhet Sadar"][i],
    patients: 150 + ((i * 37) % 250),
    monthsFlagged: 0,
    history: {
      bpControlled: series(63 + (i % 4), 64 + (i % 5), { volatility: 0.6 }),
      bpUncontrolled: flat(14 + (i % 3)),
      dmControlled: flat(54),
      dmUncontrolled: flat(22),
      htnNoVisit3m: flat(20 + (i % 4)),
      htnNoVisit12m: flat(12),
      dmNoVisit3m: flat(22),
      dmNoVisit12m: flat(14),
      titration: flat(42 + (i % 5)),
      statin: flat(50),
      fudging: flat(5 + (i % 3), 0.4),
      stock: stockSeries("full"),
    },
    insights: [{ headline: "On target, no concerning signals", detail: "All indicators within expected range. Light-touch review only.", basis: ["all indicators"] }],
    investigations: [],
  })),
];
