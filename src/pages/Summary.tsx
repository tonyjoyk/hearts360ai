import { DistrictSummary } from "@/components/DistrictSummary";

/**
 * Standalone /summary route — same as the original Index page. Kept as its
 * own route so the home shell at "/" can host the new Dashboard card.
 */
export default function Summary() {
  return (
    <main className="min-h-screen bg-background">
      <DistrictSummary />
    </main>
  );
}
