import { cn } from "@/lib/utils";

interface Props {
  days: number;
}

/**
 * Drug-stock status chip placed prominently right under the indicator grid.
 * Color depends on days of stock: 0–15 red, 16–45 amber, 46+ neutral.
 */
export function StockChip({ days }: Props) {
  let level: "low" | "partial" | "ok";
  let label: string;
  if (days <= 15) {
    level = "low";
    label = "Low drug stock";
  } else if (days <= 45) {
    level = "partial";
    label = "Partial drug stock";
  } else {
    level = "ok";
    label = "Drug stock";
  }

  const wrap =
    level === "low"
      ? "bg-bad-soft border-bad/20 text-bad-soft-foreground"
      : level === "partial"
      ? "bg-amber-bg border-amber-border text-amber-text"
      : "bg-surface-sunken border-border text-foreground/70";

  const dot =
    level === "low" ? "bg-bad" : level === "partial" ? "bg-[hsl(32_85%_45%)]" : "bg-muted-foreground/60";

  return (
    <div className={cn("mb-6 flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5", wrap)}>
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} aria-hidden />
      <span className="flex-1 text-[12px] font-medium">{label}</span>
      <span className="font-mono text-[14px] font-bold tnum">{days} days</span>
    </div>
  );
}
