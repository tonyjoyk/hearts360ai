import { DashboardCard } from "@/components/DashboardCard";
import { postToHost } from "@/hooks/useEmbedded";

/**
 * Iframe-friendly version of just the Dashboard card. Hosts can embed this
 * directly if they only want the small card without the side panel system.
 */
export default function EmbedDashboardCard() {
  return (
    <div className="min-h-screen bg-transparent p-3">
      <DashboardCard
        onOpen={() => postToHost({ type: "hearts360:open" })}
        onFacilityClick={(id) => postToHost({ type: "hearts360:facility", id })}
      />
    </div>
  );
}
