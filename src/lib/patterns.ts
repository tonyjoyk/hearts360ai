import { Facility, Status, TemporalLabel, FacilityHistory, BP_GOAL } from "@/data/facilities";

// ===== Math helpers =====
export const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
export const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

// ===== Per-indicator views =====
export interface IndicatorSeriesView {
  current: number;
  prev: number;
  delta: number;          // current - prev
  avg6: number;           // 6-month trailing average (months 5..10, before current)
  baselineDelta: number;  // current - avg6
  series: number[];       // full 12-month series
}

export function viewSeries(arr: number[]): IndicatorSeriesView {
  const current = arr[arr.length - 1];
  const prev = arr[arr.length - 2];
  const baseline = arr.slice(arr.length - 7, arr.length - 1); // last 6 prior months
  const avg6 = baseline.length ? mean(baseline) : current;
  return {
    current,
    prev,
    delta: round(current - prev, 1),
    avg6: round(avg6, 1),
    baselineDelta: round(current - avg6, 1),
    series: arr,
  };
}

// ===== Status (red/amber/green) =====
// Action needed: at least 2 simultaneously bad signals, or BP <50 with another red.
// At risk: one concerning indicator OR a high-volume facility with moderate slip.
// On target: BP at/above goal with no major reds.
export function deriveStatus(f: Facility): Status {
  const bp = viewSeries(f.history.bpControlled).current;
  const titr = viewSeries(f.history.titration).current;
  const missed = viewSeries(f.history.htnNoVisit3m).current;
  const fudge = viewSeries(f.history.fudging).current;
  const stock = f.history.stock[f.history.stock.length - 1];

  const reds = [
    bp < 50,
    titr < 30,
    missed > 35,
    fudge > 12,
    stock === "low",
  ].filter(Boolean).length;

  if (reds >= 2) return "action_needed";
  if (bp < 55 && f.patients > 2000) return "at_risk"; // high-volume slip
  if (reds === 1) return "at_risk";
  return "on_target";
}

// ===== Improving overlay =====
export function isImproving(f: Facility): boolean {
  const bp = viewSeries(f.history.bpControlled);
  return bp.delta >= 2;
}

// ===== Temporal label =====
// Anomaly: |current - avg6| >= 8pp on a key indicator AND not previously flagged often.
// Persistent: monthsFlagged >= 3 — same flag recurring.
// Stagnating: monthsFlagged >= 3 AND no improvement vs 3-mo prior on the headline indicator.
// Recovering: was flagged historically, current trend up >= 6pp over last 3 months and now on target.
// New drop: newly flagged this month with a clear deterioration from baseline.
export function deriveTemporal(f: Facility): { label: TemporalLabel; detail: string } {
  const bp = viewSeries(f.history.bpControlled);
  const missed = viewSeries(f.history.htnNoVisit3m);
  const status = deriveStatus(f);

  // Recovery — current on target but had a clear historical dip
  const minBp6 = Math.min(...f.history.bpControlled.slice(0, 11));
  if (status === "on_target" && minBp6 < 50 && bp.current - minBp6 >= 8 && f.monthsFlagged === 0) {
    return { label: "recovering", detail: `BP control recovered from ${minBp6}% to ${bp.current}%.` };
  }

  // Anomaly — sharp deviation from 6-mo baseline on BP or missed visits
  const bpDev = Math.abs(bp.baselineDelta);
  const missDev = Math.abs(missed.baselineDelta);
  if ((bpDev >= 8 || missDev >= 10) && f.monthsFlagged <= 1) {
    if (bp.baselineDelta <= -8) return { label: "anomaly", detail: `BP control ${bp.current}% — 6-mo avg ${bp.avg6}%.` };
    if (missed.baselineDelta >= 10) return { label: "anomaly", detail: `Missed visits ${missed.current}% — 6-mo avg ${missed.avg6}%.` };
  }

  // Stagnation — flagged 3+ months with no improvement
  if (f.monthsFlagged >= 3) {
    const threeAgo = f.history.bpControlled[f.history.bpControlled.length - 4] ?? bp.current;
    if (bp.current - threeAgo <= 0) return { label: "stagnating", detail: `Flagged ${f.monthsFlagged} months — no improvement.` };
    return { label: "persistent", detail: `Flagged ${f.monthsFlagged} consecutive months.` };
  }

  // Persistent shorter
  if (f.monthsFlagged === 2) return { label: "persistent", detail: "Flagged 2 consecutive months." };

  // New drop
  if (f.monthsFlagged === 1 && f.isNew) return { label: "new_drop", detail: "Newly flagged this month." };

  return { label: "stable", detail: "" };
}

// ===== Composite score (0-100) =====
// Outcomes 35 + Retention 25 + Clinical 25 + Data quality penalty 15.
export function compositeScore(f: Facility): number {
  const h = f.history;
  const cur = (a: number[]) => a[a.length - 1];

  // Outcomes (35) — higher control + lower uncontrolled + lower 12m no-visit
  const outcomes =
    (cur(h.bpControlled) / 100) * 14 +
    ((100 - cur(h.bpUncontrolled)) / 100) * 7 +
    (cur(h.dmControlled) / 100) * 7 +
    ((100 - cur(h.htnNoVisit12m)) / 100) * 4 +
    ((100 - cur(h.dmNoVisit12m)) / 100) * 3;

  // Retention (25)
  const retention =
    ((100 - cur(h.htnNoVisit3m)) / 100) * 10 +
    ((100 - cur(h.dmNoVisit3m)) / 100) * 8 +
    ((100 - cur(h.htnNoVisit12m)) / 100) * 4 +
    ((100 - cur(h.dmNoVisit12m)) / 100) * 3;

  // Clinical (25)
  const stockScore = cur(h.stock) === "full" ? 1 : cur(h.stock) === "partial" ? 0.5 : 0.1;
  const clinical =
    (cur(h.titration) / 100) * 10 +
    stockScore * 10 +
    (cur(h.statin) / 100) * 5;

  // Data quality penalty (15) — lower fudging is better, full 15 at 0% fudging, 0 at 25%+
  const fudge = cur(h.fudging);
  const dataQuality = Math.max(0, 15 * (1 - fudge / 25));

  return Math.round(outcomes + retention + clinical + dataQuality);
}

// ===== Priority ranking =====
// Lower composite score = higher priority. Ties broken by patient volume.
export function prioritize(facilities: Facility[]): Facility[] {
  return [...facilities]
    .filter((f) => deriveStatus(f) === "action_needed" || (deriveStatus(f) === "at_risk" && f.patients > 1500))
    .sort((a, b) => {
      const sa = compositeScore(a);
      const sb = compositeScore(b);
      if (sa !== sb) return sa - sb;
      return b.patients - a.patients;
    });
}

// ===== "Story in one line" =====
export function storyLine(f: Facility): string {
  const t = deriveTemporal(f);
  const status = deriveStatus(f);
  const bp = viewSeries(f.history.bpControlled);
  const titr = viewSeries(f.history.titration);
  const fudge = viewSeries(f.history.fudging);
  const stock = f.history.stock[f.history.stock.length - 1];

  if (t.label === "stagnating") return `Persistent issues — flagged ${f.monthsFlagged} months. Previous approach is not working.`;
  if (t.label === "persistent" && stock !== "full") return `Persistent ${stock === "low" ? "drug stockout" : "stock disruption"} driving the decline.`;
  if (t.label === "persistent" && fudge.current > 12) return `Persistent measurement concern — headline numbers may be unreliable.`;
  if (t.label === "persistent") return `Treatment inertia — titration ${titr.current}% with ${stock} stock.`;
  if (t.label === "anomaly") return t.detail + " Investigate before concluding.";
  if (t.label === "new_drop") return `New drop this month — verify before treating as a trend.`;
  if (t.label === "recovering") return t.detail;
  if (status === "on_target") return `On target — ${bp.current}% BP control.`;
  return `${bp.current}% BP control, monitoring.`;
}

// ===== Sparkline path =====
export function sparkPath(arr: number[], w = 80, h = 24, padY = 2): string {
  if (arr.length === 0) return "";
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min || 1;
  return arr
    .map((v, i) => {
      const x = (i / (arr.length - 1)) * w;
      const y = h - padY - ((v - min) / range) * (h - padY * 2);
      return `${i === 0 ? "M" : "L"}${round(x, 2)},${round(y, 2)}`;
    })
    .join(" ");
}
