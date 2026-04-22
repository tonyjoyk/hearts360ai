import { Status, TemporalLabel } from "@/data/facilities";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Status, string> = {
  action_needed: "Action needed",
  at_risk: "At risk",
  on_target: "On target",
};

export function StatusTag({ status, improving, className }: { status: Status; improving?: boolean; className?: string }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium";
  if (status === "action_needed")
    return (
      <span className={cn(base, "bg-bad text-bad-foreground", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-bad-foreground" />
        {STATUS_LABEL[status]}
        {improving ? <span className="ml-1 opacity-90">· Improving</span> : null}
      </span>
    );
  if (status === "at_risk")
    return (
      <span className={cn(base, "bg-bad-soft text-bad-soft-foreground border border-bad/20", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-bad" />
        {STATUS_LABEL[status]}
        {improving ? <span className="ml-1">· Improving</span> : null}
      </span>
    );
  return (
    <span className={cn(base, "bg-good-soft text-good-soft-foreground border border-good/20", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-good" />
      {STATUS_LABEL[status]}
      {improving ? <span className="ml-1">· Improving</span> : null}
    </span>
  );
}

const TEMPORAL_LABEL: Record<TemporalLabel, string> = {
  new_drop: "New drop",
  persistent: "Persistent",
  stagnating: "Stagnating",
  anomaly: "Anomaly",
  recovering: "Recovering",
  stable: "",
};

export function TemporalTag({ label, monthsFlagged, className }: { label: TemporalLabel; monthsFlagged?: number; className?: string }) {
  if (label === "stable") return null;
  const text = label === "persistent" && monthsFlagged ? `Persistent · month ${monthsFlagged}` : TEMPORAL_LABEL[label];
  const tone =
    label === "recovering"
      ? "bg-good-soft text-good-soft-foreground border-good/30"
      : label === "stagnating"
      ? "bg-bad-soft text-bad-soft-foreground border-bad/40"
      : "bg-surface-sunken text-foreground border-border-strong";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium", tone, className)}>
      {text}
    </span>
  );
}
