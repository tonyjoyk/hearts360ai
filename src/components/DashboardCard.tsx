import { ArrowUpRight } from "lucide-react";
import { DISTRICT, FACILITIES, getNeedsAttention } from "@/data/facilities";
import { Sparkline } from "@/components/Sparkline";
import { StatusTag } from "@/components/StatusTag";
import { cn } from "@/lib/utils";

interface Props {
  onOpen?: () => void;
  onFacilityClick?: (id: string) => void;
}

/**
 * Compact dashboard card for the home shell — modeled on the Google Analytics
 * "Recommendation" tile. Shows one headline KPI with a sparkline and the top
 * 3 facilities that need attention. Primary action opens the full District
 * summary side panel.
 */
export function DashboardCard({ onOpen, onFacilityClick }: Props) {
  const headline = DISTRICT.stats[0]; // BP control
  const top3 = getNeedsAttention(FACILITIES, new Set(), new Set(), 3);

  const deltaSign = headline.delta > 0 ? "+" : headline.delta < 0 ? "\u2212" : "";
  const deltaIsGood =
    headline.delta === 0
      ? null
      : (headline.goodDir === "up" ? headline.delta > 0 : headline.delta < 0);
  const deltaCls =
    deltaIsGood === null
      ? "text-muted-foreground"
      : deltaIsGood
      ? "text-good"
      : "text-bad";

  return (
    <section
      aria-label="District dashboard"
      className="overflow-hidden rounded-xl border bg-surface shadow-sm"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between border-b bg-surface-sunken/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
            Dashboard
          </span>
          <span className="rounded-[3px] bg-foreground px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[0.3px] text-background">
            April
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-muted-foreground tnum">
          Sylhet · {DISTRICT.facilityCount} facilities
        </span>
      </div>

      <div className="p-4">
        {/* Headline KPI — delta-first, matching the District summary */}
        <div className="mb-3 flex items-end gap-3">
          <div className="min-w-0">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.4px] text-muted-foreground">
              {headline.label}
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className={cn("font-mono text-[28px] font-bold leading-none tracking-[-0.5px] tnum", deltaCls)}>
                {deltaSign}
                {Math.abs(headline.delta)} pp
              </span>
              <span className="font-mono text-[12px] text-muted-foreground tnum">
                now <strong className="font-semibold text-foreground/80">{headline.value}%</strong>
              </span>
            </div>
          </div>
          <div className="ml-auto h-9 w-24">
            <Sparkline
              current={headline.value}
              delta={headline.delta}
              goodDir={headline.goodDir}
              height={36}
              width={96}
            />
          </div>
        </div>

        {/* Top 3 facilities */}
        <div className="mb-3 border-t pt-3">
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
            Facilities that need attention
          </div>
          <ul className="space-y-1">
            {top3.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onFacilityClick?.(f.id)}
                  className="block w-full rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-surface-sunken"
                >
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-medium">{f.name}</span>
                    <StatusTag status={f.status} />
                  </div>
                  {f.cardInsights[0] && (
                    <p className="line-clamp-2 text-[11.5px] leading-[1.4] text-muted-foreground">
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
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2.5 text-[12.5px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          View District summary
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
