import { useState } from "react";
import { Facility } from "@/data/facilities";
import { deriveStatus, deriveTemporal, isImproving, storyLine, viewSeries } from "@/lib/patterns";
import { Sparkline } from "./Sparkline";
import { StatusTag, TemporalTag } from "./StatusTag";
import { useFieldContext, useVisited } from "@/hooks/useLocalState";
import { Check, ChevronDown, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndicatorTile {
  label: string;
  series: number[];
  format: (n: number) => string;
  direction: "up_good" | "up_bad";
  bad?: (n: number) => boolean;
}

function FacilityDetail({ f }: { f: Facility }) {
  const h = f.history;
  const { getContext, setContext } = useFieldContext();
  const { isVisited, markVisited, visitedAt } = useVisited();
  const [draft, setDraft] = useState(getContext(f.id) || f.fieldContext || "");
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const tiles: IndicatorTile[] = [
    { label: "BP controlled", series: h.bpControlled, format: (n) => `${n}%`, direction: "up_good", bad: (n) => n < 50 },
    { label: "Missed visits 3m (HTN)", series: h.htnNoVisit3m, format: (n) => `${n}%`, direction: "up_bad", bad: (n) => n > 30 },
    { label: "Titration", series: h.titration, format: (n) => `${n}%`, direction: "up_good", bad: (n) => n < 35 },
    { label: "Statin prescription", series: h.statin, format: (n) => `${n}%`, direction: "up_good" },
    { label: "BP fudging", series: h.fudging, format: (n) => `${n}%`, direction: "up_bad", bad: (n) => n > 12 },
  ];

  const stockNow = h.stock[h.stock.length - 1];

  return (
    <div className="space-y-5 px-4 pb-5 pt-2 sm:px-5">
      {/* Story line */}
      <p className="text-sm font-medium text-foreground">{storyLine(f)}</p>

      {/* Trend strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((t) => {
          const v = viewSeries(t.series);
          const isBad = t.bad?.(v.current) ?? false;
          return (
            <div key={t.label} className="rounded-md border bg-surface-sunken/60 p-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</span>
                <Sparkline data={t.series} width={56} height={18} direction={t.direction} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("font-mono tnum text-base font-semibold", isBad && "text-bad")}>{t.format(v.current)}</span>
                <span className="text-[11px] text-muted-foreground">6-mo {t.format(v.avg6)}</span>
              </div>
            </div>
          );
        })}
        <div className="rounded-md border bg-surface-sunken/60 p-2.5">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Drug stock</div>
          <div className={cn("font-mono tnum text-base font-semibold capitalize", stockNow !== "full" && "text-bad")}>
            {stockNow}
          </div>
        </div>
      </div>

      {/* Insights */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it's flagged</h4>
        <ol className="space-y-2.5">
          {f.insights.map((ins, i) => (
            <li key={i} className="rounded-md border border-border bg-surface p-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{ins.headline}</p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{ins.detail}</p>
                  <p className="mt-1.5 font-mono text-[11px] italic text-muted-foreground">
                    Data basis: {ins.basis.join(" · ")}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Investigation */}
      {f.investigations.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verify on the ground</h4>
          <ul className="space-y-2">
            {f.investigations.map((inv, i) => {
              const done = !!checked[i];
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                    className="flex w-full items-start gap-3 rounded-md border bg-surface p-3 text-left transition-colors hover:bg-surface-sunken/70"
                  >
                    <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border", done ? "border-good bg-good text-good-foreground" : "border-border-strong bg-surface")}>
                      {done && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm", done && "text-muted-foreground line-through")}>{inv.step}</span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Tests: {inv.tests}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Field context */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Field context</h4>
        <div className="rounded-md border bg-surface p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => setContext(f.id, draft)}
            placeholder="Add what you know that the data doesn't show — known stock issue, staff turnover, seasonal migration, etc."
            className="min-h-[72px] w-full resize-y rounded-md border bg-surface-sunken/60 p-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Known stock issue", "Staff turnover", "Seasonal migration", "Equipment problem"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setDraft((d) => (d ? `${d}\n• ${tag}` : `• ${tag}`))}
                className="rounded-full border bg-surface px-2.5 py-1 text-xs hover:bg-surface-sunken"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Visit action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <span className="text-xs text-muted-foreground">
          {isVisited(f.id)
            ? `Marked visited ${new Date(visitedAt(f.id)!).toLocaleDateString()}`
            : "Closes the loop and informs next month's stagnation detection."}
        </span>
        <button
          type="button"
          onClick={() => markVisited(f.id)}
          disabled={isVisited(f.id)}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {isVisited(f.id) ? "Visit logged" : "Mark as visited"}
        </button>
      </div>
    </div>
  );
}

interface CardProps {
  facility: Facility;
  defaultOpen?: boolean;
  variant?: "priority" | "list";
  rank?: number;
}

export function FacilityCard({ facility: f, defaultOpen = false, variant = "list", rank }: CardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const status = deriveStatus(f);
  const temporal = deriveTemporal(f);
  const improving = isImproving(f);
  const { getContext } = useFieldContext();
  const { isVisited } = useVisited();
  const ctx = getContext(f.id) || f.fieldContext;

  const bp = viewSeries(f.history.bpControlled);
  const missed = viewSeries(f.history.htnNoVisit3m);
  const titr = viewSeries(f.history.titration);

  const isPriority = variant === "priority";

  return (
    <article
      className={cn(
        "rounded-lg border bg-surface transition-colors",
        isPriority ? "border-strong shadow-sm" : "border-border",
        ctx && "opacity-95"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
        aria-expanded={open}
      >
        {isPriority && rank != null && (
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-sm font-semibold text-background">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-base font-semibold leading-tight">{f.name}</h3>
            {isVisited(f.id) && <span className="rounded-full bg-good-soft px-1.5 py-0.5 font-mono text-[10px] uppercase text-good-soft-foreground">visited</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{f.upazila}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{f.patients.toLocaleString()} patients</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusTag status={status} improving={improving} />
            <TemporalTag label={temporal.label} monthsFlagged={f.monthsFlagged} />
            {ctx && <span className="inline-flex items-center rounded-full border border-border-strong bg-surface-sunken px-2 py-0.5 text-xs">Field context logged</span>}
          </div>
          {isPriority && (
            <p className="mt-2.5 text-sm leading-snug text-foreground">{storyLine(f)}</p>
          )}
          {/* Mini-row of three key chips */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Chip label="BP ctrl" value={`${bp.current}%`} bad={bp.current < 50} sub={`6-mo ${bp.avg6}%`} series={f.history.bpControlled} dir="up_good" />
            <Chip label="Missed 3m" value={`${missed.current}%`} bad={missed.current > 30} sub={`6-mo ${missed.avg6}%`} series={f.history.htnNoVisit3m} dir="up_bad" />
            <Chip label="Titration" value={`${titr.current}%`} bad={titr.current < 35} sub={`6-mo ${titr.avg6}%`} series={f.history.titration} dir="up_good" />
          </div>
        </div>
        <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div className="animate-fade-in border-t">
          <FacilityDetail f={f} />
        </div>
      )}
    </article>
  );
}

function Chip({ label, value, sub, bad, series, dir }: { label: string; value: string; sub: string; bad?: boolean; series: number[]; dir: "up_good" | "up_bad" }) {
  return (
    <div className="rounded-md border bg-surface-sunken/60 p-2">
      <div className="mb-0.5 flex items-center justify-between gap-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
        <Sparkline data={series} width={36} height={14} direction={dir} />
      </div>
      <div className={cn("font-mono tnum text-sm font-semibold", bad && "text-bad")}>{value}</div>
      <div className="font-mono text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
