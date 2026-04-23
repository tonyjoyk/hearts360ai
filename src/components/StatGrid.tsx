import { Sparkline } from "./Sparkline";

interface Stat {
  label: string;
  value: number;
  delta: number;
  goodDir: "up" | "down";
}

interface Props {
  stats: Stat[];
}

function fmtDelta(d: number): { text: string; cls: string } {
  if (d === 0) return { text: "0", cls: "text-muted-foreground/70" };
  return { text: d > 0 ? `+${d}` : `\u2212${Math.abs(d)}`, cls: "" }; // sign-only, color set per row below
}

export function StatGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
      {stats.map((s) => {
        const d = fmtDelta(s.delta);
        let deltaCls = "text-muted-foreground/70";
        if (s.delta !== 0) {
          const positive = s.delta > 0;
          const isGood = s.goodDir === "up" ? positive : !positive;
          deltaCls = isGood ? "text-good" : "text-bad";
        }
        return (
          <div key={s.label} className="bg-surface p-3">
            <div className="mb-1 text-[11px] leading-tight text-muted-foreground">{s.label}</div>
            <div className="mb-2 flex items-baseline gap-1.5">
              <span className="font-mono tnum text-[22px] font-bold leading-none tracking-tight">
                {s.value}%
              </span>
              <span className={`font-mono text-[12px] font-semibold ${deltaCls}`}>{d.text}</span>
            </div>
            <Sparkline current={s.value} delta={s.delta} goodDir={s.goodDir} />
          </div>
        );
      })}
    </div>
  );
}
