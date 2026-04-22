import { FACILITIES, BP_GOAL, MONTH_LABELS } from "@/data/facilities";
import { Sparkline } from "./Sparkline";
import { TrendingDown, TrendingUp } from "lucide-react";

// District aggregates derived from the sample data, mirroring the Sylhet Oct-2025 PDF.
function districtAgg() {
  const months = 12;
  const totalPatients = FACILITIES.reduce((s, f) => s + f.patients, 0);
  const weighted = (key: keyof typeof FACILITIES[0]["history"]) => {
    return Array.from({ length: months }, (_, m) => {
      let num = 0, den = 0;
      for (const f of FACILITIES) {
        const v = f.history[key][m];
        if (typeof v === "number") {
          num += v * f.patients;
          den += f.patients;
        }
      }
      return den ? Math.round((num / den) * 10) / 10 : 0;
    });
  };
  return {
    totalPatients,
    bp: weighted("bpControlled"),
    bpUnc: weighted("bpUncontrolled"),
    missed3m: weighted("htnNoVisit3m"),
    titration: weighted("titration"),
    statin: weighted("statin"),
    fudging: weighted("fudging"),
  };
}

function fmtDelta(curr: number, prev: number, direction: "up_good" | "up_bad") {
  const d = Math.round((curr - prev) * 10) / 10;
  if (d === 0) return { text: "no change", tone: "muted" as const, Icon: null };
  const positive = d > 0;
  const isGood = direction === "up_good" ? positive : !positive;
  return {
    text: `${positive ? "+" : ""}${d}pp`,
    tone: isGood ? "good" : ("bad" as const),
    Icon: positive ? TrendingUp : TrendingDown,
  };
}

export function DistrictPulse() {
  const agg = districtAgg();
  const last = (a: number[]) => a[a.length - 1];
  const prev = (a: number[]) => a[a.length - 2];

  const cards = [
    { label: "BP controlled", series: agg.bp, dir: "up_good" as const, suffix: "%" },
    { label: "Missed visit 3m", series: agg.missed3m, dir: "up_bad" as const, suffix: "%" },
    { label: "Titration", series: agg.titration, dir: "up_good" as const, suffix: "%" },
    { label: "Fudging", series: agg.fudging, dir: "up_bad" as const, suffix: "%" },
  ];

  const bpCurrent = last(agg.bp);
  const gap = Math.max(0, BP_GOAL - bpCurrent);

  // "What changed" — derived
  const flagged = FACILITIES.filter((f) => f.monthsFlagged > 0).length;
  const improvingCount = FACILITIES.filter((f) => last(f.history.bpControlled) - prev(f.history.bpControlled) >= 2).length;
  const stockIssues = FACILITIES.filter((f) => f.history.stock[f.history.stock.length - 1] !== "full").length;

  return (
    <section aria-labelledby="district-pulse" className="space-y-3">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h2 id="district-pulse" className="text-lg font-semibold leading-tight">Sylhet District</h2>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            October 2025 · {FACILITIES.length} facilities · {agg.totalPatients.toLocaleString()} patients
          </p>
        </div>
      </header>

      {/* Goal headline */}
      <div className="rounded-lg border bg-surface p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">BP control vs 2025 goal</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono tnum text-3xl font-semibold">{bpCurrent}%</span>
              <span className="font-mono tnum text-sm text-muted-foreground">/ {BP_GOAL}% goal</span>
            </div>
          </div>
          <Sparkline data={agg.bp} width={96} height={32} direction="up_good" />
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full bg-foreground"
            style={{ width: `${Math.min(100, (bpCurrent / BP_GOAL) * 100)}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          {gap > 0 ? `${gap.toFixed(1)}pp gap · 3 months remaining` : "On goal"}
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => {
          const d = fmtDelta(last(c.series), prev(c.series), c.dir);
          return (
            <div key={c.label} className="rounded-md border bg-surface p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.label}</span>
                <Sparkline data={c.series} width={48} height={18} direction={c.dir} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono tnum text-xl font-semibold">{last(c.series)}{c.suffix}</span>
                {d.Icon && (
                  <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] ${d.tone === "good" ? "text-good" : "text-bad"}`}>
                    <d.Icon className="h-3 w-3" /> {d.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* What changed */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-bad/30 bg-bad-soft/40 p-3">
          <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-bad-soft-foreground">What slipped</h3>
          <ul className="space-y-1 text-sm leading-snug">
            <li>BP control down {(prev(agg.bp) - last(agg.bp)).toFixed(1)}pp month-on-month</li>
            <li>{flagged} facilities currently flagged</li>
            <li>{stockIssues} facilities with non-full drug stock</li>
          </ul>
        </div>
        <div className="rounded-md border border-good/30 bg-good-soft/40 p-3">
          <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-good-soft-foreground">Wins worth replicating</h3>
          <ul className="space-y-1 text-sm leading-snug">
            <li>{improvingCount} facilities gained 2+pp in BP control</li>
            <li>Statin prescribing edged up to {last(agg.statin)}%</li>
            <li>Overdue-call programmes returning patients in Bishwanath</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
