import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import { SidePanel } from "@/components/SidePanel";
import { DistrictSummary } from "@/components/DistrictSummary";

/**
 * Minimal home shell. A slim wordmark, a single Dashboard card, and quiet
 * empty space below — the rest of the surface is reserved for the host site
 * (or for future cards). Clicking "View District summary" opens the
 * DistrictSummary view in a right-side push panel.
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
      style={{ paddingRight: open && typeof window !== "undefined" && window.innerWidth >= 768 ? "var(--hearts360-panel-width, 460px)" : undefined }}
    >
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold tracking-tight">hearts360</span>
            <span className="text-[11.5px] text-muted-foreground">
              Hypertension program management
            </span>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.6px] text-muted-foreground">
            Sylhet District
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-8 pt-10">
        <div className="max-w-[520px]">
          <DashboardCard
            onOpen={() => setOpen(true)}
            onFacilityClick={handleFacilityClick}
          />
        </div>
      </div>

      <SidePanel open={open} onClose={() => setOpen(false)}>
        <DistrictSummary embedded onClose={() => setOpen(false)} />
      </SidePanel>
    </main>
  );
}
