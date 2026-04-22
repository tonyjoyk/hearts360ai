import { useMemo, useState } from "react";
import { FACILITIES } from "@/data/facilities";
import { compositeScore, deriveStatus, deriveTemporal, isImproving, prioritize } from "@/lib/patterns";
import { DistrictPulse } from "@/components/DistrictPulse";
import { FacilityCard } from "@/components/FacilityCard";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | "action_needed" | "at_risk" | "on_target" | "improving" | "persistent" | "anomaly";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "action_needed", label: "Action needed" },
  { id: "at_risk", label: "At risk" },
  { id: "on_target", label: "On target" },
  { id: "improving", label: "Improving" },
  { id: "persistent", label: "Persistent" },
  { id: "anomaly", label: "Anomalies" },
];

const Index = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [listOpen, setListOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const priorities = useMemo(() => prioritize(FACILITIES).slice(0, 5), []);

  const filtered = useMemo(() => {
    const enriched = FACILITIES.map((f) => ({
      f,
      status: deriveStatus(f),
      temporal: deriveTemporal(f).label,
      improving: isImproving(f),
      score: compositeScore(f),
    }));
    const result = enriched.filter(({ status, temporal, improving }) => {
      if (filter === "all") return true;
      if (filter === "improving") return improving;
      if (filter === "persistent") return temporal === "persistent" || temporal === "stagnating";
      if (filter === "anomaly") return temporal === "anomaly" || temporal === "new_drop";
      return status === filter;
    });
    return result.sort((a, b) => a.score - b.score);
  }, [filter]);

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold leading-tight">Facility Performance Review</h1>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Sylhet District · Hypertension Programme</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHowTo((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs hover:bg-surface-sunken"
            aria-expanded={showHowTo}
          >
            <Info className="h-3.5 w-3.5" />
            How to use
          </button>
        </div>
        {showHowTo && (
          <div className="border-t bg-surface-sunken/60 px-4 py-3 text-xs leading-snug text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">This tool tells you where to look — not what to conclude.</p>
            <p>Every insight names the data it's built on. Treat the investigation steps as required verification before acting. If the data and the field don't agree, trust the field and log what you saw — the tool will deprioritise that signal next month.</p>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-5">
        {/* District pulse */}
        <DistrictPulse />

        {/* Priorities */}
        <section aria-labelledby="priorities">
          <header className="mb-2 flex items-end justify-between gap-3">
            <div>
              <h2 id="priorities" className="text-lg font-semibold leading-tight">This month's priorities</h2>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {priorities.length} facilities ranked by composite score
              </p>
            </div>
          </header>
          <div className="space-y-3">
            {priorities.map((f, i) => (
              <FacilityCard key={f.id} facility={f} variant="priority" rank={i + 1} defaultOpen={i === 0} />
            ))}
          </div>
        </section>

        {/* Full list */}
        <section aria-labelledby="all-facilities">
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 rounded-md border bg-surface px-4 py-3 text-left"
            aria-expanded={listOpen}
          >
            <div>
              <h2 id="all-facilities" className="text-base font-semibold leading-tight">All facilities</h2>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {FACILITIES.length} total · tap to {listOpen ? "collapse" : "expand"}
              </p>
            </div>
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", listOpen && "rotate-180")} />
          </button>

          {listOpen && (
            <div className="mt-3 space-y-3">
              {/* Sticky filter pills */}
              <div className="sticky top-[57px] z-20 -mx-4 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur">
                <div className="flex gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        filter === f.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-surface text-foreground hover:bg-surface-sunken"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filtered.map(({ f }) => (
                  <FacilityCard key={f.id} facility={f} variant="list" />
                ))}
                {filtered.length === 0 && (
                  <p className="rounded-md border bg-surface p-4 text-center text-sm text-muted-foreground">
                    No facilities match this filter.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="border-t pt-4 text-center font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Prototype · Sample data · Field notes saved locally
        </footer>
      </div>
    </main>
  );
};

export default Index;
