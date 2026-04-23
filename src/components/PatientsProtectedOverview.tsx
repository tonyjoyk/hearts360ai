import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Decorative trend series for the overview chart (aligned with HEARTS360 dashboard pattern). */
const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const chartData = MONTHS.map((month, i) => ({
  month,
  patients: 3800 + i * 95 + (i % 3) * 42,
}));

export function PatientsProtectedOverview() {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 pb-4 pt-5">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground md:text-[16px]">
          Patients protected from heart attacks and strokes with world-class treatment
        </h3>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <p className="font-mono text-[2rem] font-semibold leading-none tracking-tight text-foreground">
            4,808 patients
          </p>
          <div className="pb-1 text-[13px] leading-snug text-muted-foreground">
            <p>in River District with BP &lt;140/90</p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/80" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={44}
                className="text-muted-foreground"
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value.toLocaleString()} patients`, "Protected"]}
              />
              <Area
                type="monotone"
                dataKey="patients"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#patientsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
