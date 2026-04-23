import { DashboardCard } from "@/components/DashboardCard";
import { postToHost, useEmbedded } from "@/hooks/useEmbedded";

/**
 * Iframe-friendly version of just the Dashboard card. Hosts can embed this
 * directly if they only want the small card without the side panel system.
 */
export default function EmbedDashboardCard() {
  const embedded = useEmbedded();
  return (
    <div className="min-h-0 bg-transparent p-0">
      <DashboardCard
        embedded={embedded}
        onOpen={() => postToHost({ type: "hearts360:open" })}
        onFacilityClick={(id) => postToHost({ type: "hearts360:facility", id })}
      />
    </div>
  );
}
