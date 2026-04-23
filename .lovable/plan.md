

## Refine the Dashboard card

Two small changes to `src/components/DashboardCard.tsx`:

### 1. Delta-first headline (match District summary)
Swap the visual hierarchy on the BP control KPI:
- Big number → the change: **−2 pp** (color-coded red/green, matching `DStatGrid`).
- Small number underneath → "now **54%**" in muted text.
- Sparkline stays on the right.

```text
Before                         After
54%   −2 pp     ╭───╮          −2 pp                ╭───╮
                                now 54%
```

### 2. One-line blurb under each facility
Each of the top 3 facilities gets a short line of context below the name explaining why it needs attention. We already have ideal copy in the dataset: `facility.cardInsights[0]` is a one-sentence summary written for exactly this purpose. Examples:

- **CC Osmaninagar** [Critical]
  BP control is the lowest in the district at 37%.
- **UHC Fenchuganj** [Critical]
  BP control is 38%. Many patients are not returning — 35% missed their last visit.
- **CC Kacuya Bohor** [Stagnating]
  Drug stock has been low for 4 months.

Layout: name + status tag on row 1, blurb on row 2 in muted 11.5px text, clamped to 2 lines so the card doesn't grow unpredictably. Tightened list spacing to keep the card compact.

### Files
- **Modified**: `src/components/DashboardCard.tsx` only.
- No data changes — reusing existing `cardInsights` strings.
- No changes to the side panel or summary page.

