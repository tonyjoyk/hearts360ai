import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

export interface DStat {
  label: string;
  value: number;
  delta: number;
  goodDir: "up" | "down";
}

interface Props {
  stats: DStat[];
  /** Insights embed: dividers only — outer chrome comes from the host wrapper */
  variant?: "default" | "insights";
  /** Orange-red adverse deltas (#ED6300); district overview tiles / HEARTS360 parity */
  brandOrangeBadDelta?: boolean;
}

function formatDelta(delta: number) {
  if (delta === 0) return "0 pp";
  const sign = delta > 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(delta)} pp`;
}

function deltaTone(delta: number, goodDir: "up" | "down"): "good" | "bad" | "flat" {
  if (delta === 0) return "flat";
  const positive = delta > 0;
  const isGood = goodDir === "up" ? positive : !positive;
  return isGood ? "good" : "bad";
}

const TONE_CLS: Record<"good" | "bad" | "flat", string> = {
  good: "text-good",
  bad: "text-bad",
  flat: "text-muted-foreground",
};

/** Embedded / insights tile: brand orange-red for adverse deltas (matches HEARTS360 static ds-card). */
const TONE_CLS_INSIGHTS: Record<"good" | "bad" | "flat", string> = {
  good: "text-good",
  bad: "text-[#ED6300]",
  flat: "text-muted-foreground",
};

/**
 * Delta-first stat tile grid. The big number is the month-over-month delta
 * in pp, color-coded by whether it's a good or bad direction. The current
 * value sits underneath in muted text. Sparkline anchors the trend.
 */
export function DStatGrid({
  stats,
  variant = "default",
  brandOrangeBadDelta = false,
}: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-px overflow-hidden",
        variant === "insights"
          ? "rounded-none border-0 bg-[#CBCBCB] dark:bg-neutral-600"
          : brandOrangeBadDelta
            ? "rounded-lg border border-[#CBCBCB] bg-[#CBCBCB] dark:border-neutral-600 dark:bg-neutral-600"
            : "rounded-lg border bg-border",
      )}
    >
      {stats.map((s) => {
        const tone = deltaTone(s.delta, s.goodDir);
        const orangeBad =
          variant === "insights" || brandOrangeBadDelta;
        const toneCls = orangeBad ? TONE_CLS_INSIGHTS[tone] : TONE_CLS[tone];
        return (
          <div key={s.label} className="bg-surface p-3">
            <div className="mb-1.5 text-[10.5px] font-medium leading-tight text-muted-foreground">
              {s.label}
            </div>
            <div className={`mb-0.5 font-mono text-[20px] font-bold leading-[1.1] tracking-[-0.5px] tnum ${toneCls}`}>
              {formatDelta(s.delta)}
            </div>
            <div className="mb-2 font-mono text-[11.5px] text-muted-foreground tnum">
              now <strong className="font-semibold text-foreground/80">{s.value}%</strong>
            </div>
            <Sparkline
              current={s.value}
              delta={s.delta}
              goodDir={s.goodDir}
              insightsOrangeBad={orangeBad}
            />
          </div>
        );
      })}
    </div>
  );
}
