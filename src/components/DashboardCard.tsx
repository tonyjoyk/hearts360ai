import { Sparkles } from "lucide-react";
import { DISTRICT, FACILITIES, getNeedsAttention } from "@/data/facilities";
import { Sparkline } from "@/components/Sparkline";
import { StatusTag } from "@/components/StatusTag";
import { cn } from "@/lib/utils";

interface Props {
  onOpen?: () => void;
  onFacilityClick?: (id: string) => void;
}

function formatDelta(delta: number) {
  if (delta === 0) return "0%";
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${Math.abs(delta)}%`;
}

function deltaTone(delta: number, goodDir: "up" | "down"): "good" | "bad" | "flat" {
  if (delta === 0) return "flat";
  const isGood = goodDir === "up" ? delta > 0 : delta < 0;
  return isGood ? "good" : "bad";
}

const TONE_CLS: Record<"good" | "bad" | "flat", string> = {
  good: "text-good",
  bad: "text-bad",
  flat: "text-muted-foreground",
};

/**
 * Compact "District summary" dashboard card. Mirrors the District summary
 * panel: ✨-prefixed title, a 3-up KPI tile grid (delta-first, with mini
 * sparklines), the top 3 facilities that need attention with full context
 * blurbs, and a primary "View district report" action.
 *
 * Visual emphasis: thin blue accent bar across the top, blue Sparkles, blue
 * CTA, and a slightly heavier border + shadow so the card reads as the
 * primary surface on the Home shell without becoming loud.
 */
export function DashboardCard({ onOpen, onFacilityClick }: Props) {
  const headlineKeys = ["bpControl", "bpUncontrolled", "missed"];
  const headline = DISTRICT.stats.filter((s) => headlineKeys.includes(s.key));
  const top3 = getNeedsAttention(FACILITIES, new Set(), new Set(), 3);

  return (
    <section
      aria-label="District summary"
      className="overflow-hidden rounded-xl border-2 border-border bg-surface shadow-md"
    >
      {/* Blue accent strip — single decorative cue */}
      <div className="h-[3px] bg-accent-blue" aria-hidden="true" />

      <div className="p-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-accent-blue" aria-hidden="true" />
          <h2 className="text-[18px] font-bold leading-none tracking-tight">
            District summary
          </h2>
        </div>

        {/* KPI grid — 3 tiles with sparklines */}
        <div className="mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
          {headline.map((s) => {
            const tone = deltaTone(s.delta, s.goodDir);
            return (
              <div key={s.key} className="bg-surface p-3">
                <div className="mb-1.5 text-[10.5px] font-medium leading-tight text-muted-foreground">
                  {s.label}
                </div>
                <div
                  className={cn(
                    "mb-0.5 font-mono text-[20px] font-bold leading-[1.1] tracking-[-0.5px] tnum",
                    TONE_CLS[tone],
                  )}
                >
                  {formatDelta(s.delta)}
                </div>
                <div className="mb-2 font-mono text-[11.5px] text-muted-foreground tnum">
                  now <strong className="font-semibold text-foreground/80">{s.value}%</strong>
                </div>
                <Sparkline current={s.value} delta={s.delta} goodDir={s.goodDir} />
              </div>
            );
          })}
        </div>

        {/* Top 3 facilities */}
        <div className="mb-5">
          <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
            Facilities that need attention
          </div>
          <ul className="space-y-3.5">
            {top3.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onFacilityClick?.(f.id)}
                  className="block w-full rounded-md text-left transition-colors hover:bg-surface-sunken/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <span className="text-[13.5px] font-semibold leading-tight">
                      {f.name}
                    </span>
                    <StatusTag status={f.status} className="mt-0.5 shrink-0" />
                  </div>
                  {f.cardInsights[0] && (
                    <p className="text-[12.5px] leading-[1.45] text-foreground/75">
                      {f.cardInsights[0]}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Primary action */}
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-center rounded-lg bg-accent-blue px-4 py-3 text-[13.5px] font-semibold text-accent-blue-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View district report
        </button>
      </div>
    </section>
  );
}
