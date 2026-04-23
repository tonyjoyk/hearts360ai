import { DISTRICT, FACILITIES, getNeedsAttention } from "@/data/facilities";
import type { Facility } from "@/data/facilities";
import { STATUS_LABEL } from "@/components/StatusTag";

/** First three overview tiles — same slice as DashboardCard / HEARTS360 static ds-card. */
export interface OverviewStatRow {
  label: string;
  value: number;
  delta: number;
  goodDir: "up" | "down";
}

/** Snapshot row for static HTML (side panel uses the same source `Facility`). */
export interface OverviewFacilityRow {
  id: string;
  name: string;
  badgeLabel: string;
  summaryLine: string;
}

/**
 * Canonical model for the overview tile (React DashboardCard + HEARTS360 static card).
 * The side panel {@link DistrictSummary} reads the same {@link FACILITIES} / {@link DISTRICT} tables.
 */
export function getOverviewCardModel(): {
  stats: OverviewStatRow[];
  topFacilities: Facility[];
} {
  const stats = DISTRICT.stats.slice(0, 3).map((s) => ({
    label: s.label,
    value: s.value,
    delta: s.delta,
    goodDir: s.goodDir,
  }));

  const topFacilities = getNeedsAttention(FACILITIES, new Set(), new Set(), 3);

  return { stats, topFacilities };
}

export function facilityToOverviewRow(f: Facility): OverviewFacilityRow {
  return {
    id: f.id,
    name: f.name,
    badgeLabel: STATUS_LABEL(f.status),
    summaryLine: f.cardInsights[0] ?? "",
  };
}
