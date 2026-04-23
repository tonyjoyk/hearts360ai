import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { FACILITIES } from "@/data/facilities";
import { StatGrid } from "@/components/StatGrid";
import { StatusTag } from "@/components/StatusTag";
import { useFieldContext, useVisited } from "@/hooks/useLocalState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const facility = useMemo(() => FACILITIES.find((f) => f.id === id), [id]);
  const { isVisited, toggleVisited } = useVisited();
  const { getContext, setContext } = useFieldContext();
  const savedUserContext = facility ? getContext(facility.id) : "";
  const [draft, setDraft] = useState("");

  if (!facility) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-[420px] p-6">
          <p className="mb-3 text-sm">Facility not found.</p>
          <Link to="/" className="text-sm underline">Back to district summary</Link>
        </div>
      </main>
    );
  }

  const visited = isVisited(facility.id);

  const stats = [
    { label: "BP control", value: facility.bpControl, delta: facility.bpControlT, goodDir: "up" as const },
    { label: "BP uncontrolled", value: facility.bpUncontrolled, delta: facility.bpUncontrolledT ?? -facility.bpControlT, goodDir: "down" as const },
    { label: "Missed visit", value: facility.missed3m, delta: facility.missed3mT ?? (facility.bpControlT < 0 ? 1 : 0), goodDir: "down" as const },
    { label: "Titration rate", value: facility.titration, delta: facility.titrationT ?? 0, goodDir: "up" as const },
    { label: "Statin prescription", value: facility.statins, delta: facility.statinsT ?? 0, goodDir: "up" as const },
    { label: "BP fudging", value: facility.fudging, delta: facility.fudgingT ?? 0, goodDir: "down" as const },
  ];

  const handleSaveContext = () => {
    if (!draft.trim()) return;
    const merged = savedUserContext ? `${savedUserContext}\n\n${draft.trim()}` : draft.trim();
    setContext(facility.id, merged);
    setDraft("");
    toast.success("Field context saved");
  };

  const handleVisited = () => {
    toggleVisited(facility.id);
    if (!visited) toast.success(`Marked ${facility.name} as visited`);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen max-w-[420px] animate-in fade-in slide-in-from-right-4 border-x border-border bg-surface px-[18px] pb-20 pt-5 duration-200 sm:my-6 sm:rounded-xl sm:border">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-surface text-foreground/70 transition-colors hover:bg-surface-sunken"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className="text-base font-bold">{facility.name}</span>
              <StatusTag status={facility.status} />
            </div>
            <div className="font-mono text-[12px] text-muted-foreground tnum">
              {facility.patients.toLocaleString()} patients
            </div>
          </div>
        </div>

        {/* Detail summary */}
        <ul className="mb-5 space-y-0">
          {facility.detailSummary.map((s, idx) => (
            <li
              key={idx}
              className="relative py-[3px] pl-4 text-[13.5px] font-medium leading-[1.55] before:absolute before:left-0 before:top-[11px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-foreground/70"
            >
              {s}
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="mb-5">
          <StatGrid stats={stats} />
        </div>

        {/* Insight blocks */}
        <div className="space-y-[18px]">
          {facility.insightBlocks.map((b, idx) => (
            <div key={idx}>
              <h4 className="mb-1 text-[13.5px] font-bold">{b.title}</h4>
              <p className="text-[13px] leading-[1.55] text-foreground/80">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Verify */}
        <div className="mb-[18px] mt-[18px]">
          <h4 className="mb-1.5 text-[13.5px] font-bold">Verify on the ground</h4>
          <ul className="space-y-0">
            {facility.verify.map((v, idx) => (
              <li
                key={idx}
                className="relative py-[3px] pl-4 text-[13px] leading-[1.55] text-foreground/80 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground"
              >
                {v}
              </li>
            ))}
          </ul>
        </div>

        {/* Drug stock chip */}
        <div className="mb-4 inline-block rounded-[5px] border bg-surface px-2.5 py-1.5 text-[12px] text-foreground/80">
          Days of drug stock: <strong className="font-mono font-semibold tnum text-foreground">{facility.daysStock}</strong>
        </div>

        {/* Saved context — pre-baked + user-saved */}
        {(facility.savedContext || savedUserContext) && (
          <div className="mb-4">
            <h4 className="mb-1.5 text-[13.5px] font-bold">Field context</h4>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-[1.55] text-foreground/85">
              {facility.savedContext && <p>{facility.savedContext}</p>}
              {savedUserContext && (
                <p className={facility.savedContext ? "mt-2" : undefined}>{savedUserContext}</p>
              )}
            </div>
          </div>
        )}

        {/* Add context */}
        <div className="mb-4">
          <h4 className="mb-1.5 text-[13.5px] font-bold">Add context from the field</h4>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add what you know from visiting the facility. This helps future reports focus on what you can actually fix."
            className="min-h-[60px] w-full resize-y rounded-md border bg-surface px-3 py-2.5 text-[13px] leading-[1.5] text-foreground/85 outline-none focus:border-strong"
          />
          {draft.trim() && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveContext}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-surface-sunken"
              >
                Save context
              </button>
            </div>
          )}
        </div>

        {/* Visited */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleVisited}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors",
              visited
                ? "bg-good text-good-foreground hover:bg-good-soft-foreground"
                : "bg-foreground text-background hover:bg-foreground/85",
            )}
          >
            {visited && <Check className="h-3.5 w-3.5" />}
            {visited ? "Visited" : "Mark as visited"}
          </button>
        </div>
      </div>
    </main>
  );
}
