import { sparkPath } from "@/lib/patterns";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  direction?: "up_good" | "up_bad" | "neutral";
  className?: string;
}

/**
 * Single-tone sparkline. The endpoint dot is colored by whether the trend
 * direction is good or bad — never decorative.
 */
export function Sparkline({ data, width = 80, height = 24, direction = "neutral", className = "" }: Props) {
  if (data.length < 2) return null;
  const path = sparkPath(data, width, height);
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const cx = width;
  const cy = height - 2 - ((last - min) / range) * (height - 4);
  const rising = last >= prev;
  let dotClass = "fill-muted-foreground";
  if (direction === "up_good") dotClass = rising ? "fill-good" : "fill-bad";
  if (direction === "up_bad") dotClass = rising ? "fill-bad" : "fill-good";
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width + 4} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.55" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r="2.2" className={dotClass} />
    </svg>
  );
}
