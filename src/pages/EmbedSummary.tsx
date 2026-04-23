import { DistrictSummary } from "@/components/DistrictSummary";
import { postToHost } from "@/hooks/useEmbedded";

/**
 * Iframe-friendly version of the District summary. Used by /public/embed.js
 * to mount this app as a side panel on external hosts (e.g. hearts360).
 * - Drops the centered card frame.
 * - Close button posts {type:'hearts360:close'} to window.parent.
 */
export default function EmbedSummary() {
  return (
    <div className="min-h-screen bg-surface">
      <DistrictSummary embedded onClose={() => postToHost({ type: "hearts360:close" })} />
    </div>
  );
}
