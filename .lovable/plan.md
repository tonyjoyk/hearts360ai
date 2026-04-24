## Goal

Three things:

1. **Keep familiar medical terminology** but fix the unit + label issues users flagged.
2. **Make the Dashboard card stand out** on Home — minimal, with a blue CTA.
3. **Simplify the bullet copy** under the District summary and under each facility so it's quick to read on a phone.

## 1. Copy & label fixes

Keep all terms users recognize: BP control, BP uncontrolled, Critical, At risk, On target, Improving, Stagnating, Top performer, Needs attention.

Only the following text changes:

| Where | Old | New |
|---|---|---|
| All delta values | `−2 pp`, `+1 pp`, `0 pp` | `-2%`, `+1%`, `0%` |
| District stat label | `Statin prescription` | `Statins prescribed` |
| District stat label | `Missed visit` | `No visit in 3 months` |

### Files

- `src/components/DStatGrid.tsx` — `formatDelta()` returns `-2%` / `+1%` / `0%` (ASCII minus).
- `src/components/DashboardCard.tsx` — same `formatDelta()` updated identically.
- `src/data/facilities.ts` — `DISTRICT.stats`: rename `"Statin prescription"` → `"Statins prescribed"` and `"Missed visit"` → `"No visit in 3 months"`. `key` fields unchanged.

## 2. Make the Dashboard card stand out (minimal)

### CTA: black → blue

- Add `--accent-blue: 217 91% 50%` and `--accent-blue-foreground: 0 0% 100%` to `:root` in `src/index.css`, plus `.bg-accent-blue` / `.text-accent-blue` utilities.
- In `DashboardCard.tsx`, primary button: `bg-foreground text-background` → `bg-accent-blue text-accent-blue-foreground`.
- Tint the ✨ Sparkles icon to `text-accent-blue` so the title and CTA visually rhyme.

### Card emphasis (subtle)

- Card chrome: `border bg-surface shadow-sm` → `border-2 border-border bg-surface shadow-md`.
- Thin 3 px `bg-accent-blue` strip across the top of the card (inside the rounded corners) — the single decorative cue.
- Background stays white. No gradient, no glow, no animation.

### Page framing on Home (`src/pages/Home.tsx`)

- Remove the redundant `<h1>Home</h1>` and "Quick view of district performance." sentence — they compete with the card's own title.
- Bump card container from `max-w-[460px]` to `max-w-[520px]`.
- Add `pt-10` so the card sits in cleaner whitespace.

## 3. Simplify bullet copy (NEW)

Two places carry bullets that need to be easier to read on a phone:

### A. District insights (`DISTRICT_INSIGHTS` in `src/data/facilities.ts`)

Rewrite each of the 5 bullets to ≤ 14 words, plain present-tense English, no parenthetical numbers. Keep the same tone (`good` / `bad`) and the same facts — just shorter and simpler. Examples:

| Before | After |
|---|---|
| "BP control has dropped for 3 months in a row. The main reasons look like low titration (36%) and missed visits (31%)." | "BP control is dropping for 3 months. Few medicine changes and missed visits are the cause." |
| "6 facilities need action this month. 2 of them are new problems." | "6 facilities need action. 2 are new this month." |
| "Drug stock is low at 3 facilities. Kacuya Bohor has been low for 4 months." | "3 facilities are low on medicines. Kacuya Bohor has been low for 4 months." |
| "Overdue patient calls have doubled. About 1,000 patients came back to care last month." | "Calls to overdue patients doubled. About 1,000 patients came back." |
| "5 facilities improved by 2 points or more. Gungadiya and Paton gained 6 points each." | "5 facilities improved by 2% or more. Gungadiya and Paton gained 6%." |

### B. Per-facility bullets (`cardInsights` for every facility in `src/data/facilities.ts`)

These appear:
- under each facility on the Dashboard card (1st bullet only),
- under each facility on the District summary panel via `FacilityCard` (up to 3 bullets).

Rewrite **all 3 bullets for each facility** to:
- ≤ 12 words per bullet,
- present tense, plain words,
- no jargon: replace "fudging" → "BP numbers look wrong / not real", "titration" → "medicine changes", "retention" → "patients coming back", "intervention" → "what was tried".
- Use `%` not `pp`.
- Keep the same facts and the same order so the most important point stays first (the dashboard card uses `cardInsights[0]`).

Example rewrites:

| Before | After |
|---|---|
| "BP control is the lowest in the district at 37%." | "Lowest BP control in the district — 37%." |
| "Fudging is very high (18%). Real BP control may be even lower." | "BP numbers look wrong (18%). Real control may be lower." |
| "Medicines are not being adjusted for patients with high BP." | "Medicines are not being changed for high BP patients." |
| "BP control is 38%. Many patients are not returning — 35% missed their last visit." | "BP control is 38%. 35% of patients are not coming back." |
| "Drug stock has been low for 4 months." | "No medicines for 4 months." |
| "Local radio message about drug availability brought patients back." | "Radio message about medicines brought patients back." |
| "Close follow-up with new patients in first 3 months is working." | "Following up new patients monthly is working." |
| "Calling overdue patients before their visit is working." | "Calling patients before their visit is working." |
| "Second largest facility — 3,195 patients." | "Big facility — 3,195 patients." |
| "Fudging at 10% should be watched." | "BP numbers look slightly off (10%). Watch closely." |

Apply the same treatment to **every** `cardInsights` entry across all ~20 facilities. No changes to `detailSummary`, `concerns`, `strengths`, `verify`, or `notes` (those live on the deeper FacilityDetail page, separate scope).

## Files touched

- `src/index.css` — add `--accent-blue` tokens + utilities.
- `src/components/DStatGrid.tsx` — `pp` → `%` in `formatDelta`.
- `src/components/DashboardCard.tsx` — `pp` → `%`; blue CTA; blue Sparkles; stronger border/shadow; blue top accent bar.
- `src/data/facilities.ts` —
  - rename two stat labels,
  - rewrite all 5 `DISTRICT_INSIGHTS` bullets,
  - rewrite every facility's `cardInsights` bullets.
- `src/pages/Home.tsx` — remove redundant heading, widen card, add top padding.

## Out of scope

- Status tag wording, section headings ("Needs attention" stays), `detailSummary` / `concerns` / `strengths` / `verify` / `notes`, FacilityDetail page, side panel resizing, embed.js.
- Dark mode token tweaks (`.dark` block stays as-is; blue is the same hue in both modes).
