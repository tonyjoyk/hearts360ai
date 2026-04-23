import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import { PatientsProtectedOverview } from "@/components/PatientsProtectedOverview";
import { SidePanel } from "@/components/SidePanel";
import { DistrictSummary } from "@/components/DistrictSummary";
import { DISTRICT } from "@/data/facilities";

/**
 * HEARTS360-style overview: “Patients protected” chart (left) + district insights card (right),
 * matching the static dashboard layout. “View district report” opens the full District summary panel.
 */
export default function Home() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleFacilityClick = (id: string) => {
    navigate(`/facility/${id}`);
  };

  return (
    <main
      className="min-h-screen bg-background"
      style={{
        paddingRight:
          open && typeof window !== "undefined" && window.innerWidth >= 768
            ? "var(--hearts360-panel-width, 460px)"
            : undefined,
      }}
    >
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold tracking-tight">HEARTS360</span>
            <span className="text-[11.5px] text-muted-foreground">Hypertension dashboard</span>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.6px] text-muted-foreground">
            River District
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">River District</h1>
          <p className="text-[12.5px] text-muted-foreground">
            Data last updated: {DISTRICT.month}
          </p>
        </div>

        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          1. Overview indicators
        </h2>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-4">
          <PatientsProtectedOverview />
          <div className="min-w-0 lg:max-w-none">
            <DashboardCard
              onOpen={() => setOpen(true)}
              onFacilityClick={handleFacilityClick}
            />
          </div>
        </div>
      </div>

      <SidePanel open={open} onClose={() => setOpen(false)}>
        <DistrictSummary embedded onClose={() => setOpen(false)} />
      </SidePanel>
    </main>
  );
}
