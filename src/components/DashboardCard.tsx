import { DStatGrid, type DStat } from "@/components/DStatGrid";
import { StatusTag } from "@/components/StatusTag";
import { getOverviewCardModel } from "@/lib/overviewCardModel";
import { cn } from "@/lib/utils";

interface Props {
  onOpen?: () => void;
  onFacilityClick?: (id: string) => void;
  /** When true (e.g. HEARTS360 iframe embed), omit outer card chrome — host supplies the border */
  embedded?: boolean;
}

/**
 * HEARTS360 overview tile: three headline metrics (DStatGrid), top facilities,
 * and primary action to open the full district report panel.
 */
export function DashboardCard({ onOpen, onFacilityClick, embedded = false }: Props) {
  const { stats, topFacilities } = getOverviewCardModel();
  const INSIGHT_STATS: DStat[] = stats.map((s) => ({
    label: s.label,
    value: s.value,
    delta: s.delta,
    goodDir: s.goodDir,
  }));

  return (
    <section
      aria-label="Dashboard insights"
      className={cn(
        "overflow-hidden",
        embedded
          ? "border-0 bg-transparent shadow-none"
          : "rounded-xl border bg-surface shadow-sm",
      )}
    >
      <div className="p-4">
        {!embedded && (
          <div className="mb-4">
            <h3 className="text-[1.05rem] font-bold leading-tight tracking-tight text-foreground">
              <span className="mr-1.5" aria-hidden="true">
                ✨
              </span>
              Dashboard insights
            </h3>
          </div>
        )}

        <div
          className={cn(
            "mb-4 overflow-hidden rounded-lg border border-[#CBCBCB] bg-sky-50/60 dark:border-neutral-600 dark:bg-sky-950/25",
            embedded && "mb-3",
          )}
        >
          <DStatGrid stats={INSIGHT_STATS} variant="insights" />
        </div>

        <div className="mb-3 border-t border-border pt-3">
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
            Facilities that need attention
          </div>
          <ul className="space-y-1">
            {topFacilities.map((f) => (
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

        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-center rounded-md bg-foreground px-3 py-2.5 text-[12.5px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          View district report
        </button>
      </div>
    </section>
  );
}
