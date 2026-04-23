

## Goal

Make this Lovable app embeddable as a **right-side push panel** inside the external `simpledotorg/hearts360` site, and add a **minimal home shell** with a small Dashboard card (sparkline + top 3 facilities) that opens the District summary panel.

## What we'll build

### 1. New routes
- `/` → new **Home** page (minimal shell, Dashboard card only).
- `/summary` → existing District summary view (current `Index.tsx` content moved here, unchanged).
- `/embed/summary` → same District summary, rendered without outer page chrome (no body padding, transparent background) so it sits cleanly inside an iframe.
- `/embed/dashboard-card` → just the Dashboard card alone, for hosts who want only the card.
- `/facility/:id` → unchanged.

### 2. Dashboard card (`<DashboardCard />`)
Compact card resembling the GA "Recommendation" tile in the screenshot:

```text
┌─────────────────────────────────────────┐
│ DASHBOARD              [↗ Open summary] │
│                                         │
│ BP control       54%   ↓ 2 pp           │
│ ╭─sparkline────────────────────╮        │
│                                         │
│ Facilities that need attention          │
│ • Gobindaganj UHC      [Critical]       │
│ • Sreemangal UHC       [At risk]        │
│ • Bishwanath UHC       [At risk]        │
│                                         │
│ [ View District summary → ]             │
└─────────────────────────────────────────┘
```

- Uses existing `Sparkline`, `StatusTag`, and `getNeedsAttention(...)` helpers.
- Headline metric = `DISTRICT.stats[0]` (BP control).
- Top-3 list uses `getNeedsAttention(FACILITIES, new Set(), new Set(), 3)`.
- Primary button opens the side panel (when embedded) or routes to `/summary` (when standalone).

### 3. Home page (`/`)
Minimal shell:
- Slim top bar: "hearts360" wordmark + tagline.
- Centered single column with the `<DashboardCard />`.
- Empty quiet space below — no fake placeholder cards.

### 4. Side-panel embed system (the integration)
Two parts:

**A. Inside this app** — a tiny standalone JS embed script `public/embed.js` that the hearts360 site can include with one tag:

```html
<script src="https://hearts360ai.lovable.app/embed.js"
        data-mount="#hearts360-panel"></script>
```

The script:
- Creates a fixed right-side `<aside>` container in the host page.
- Loads `/embed/summary` inside an `<iframe>`.
- Provides a **drag handle on the left edge** to resize width (clamped 320–720 px, persisted in `localStorage`).
- Provides **open / close / toggle** API on `window.Hearts360Panel`.
- Pushes host content left by setting a CSS variable `--hearts360-panel-width` on `<html>` (host adds `padding-right: var(--hearts360-panel-width, 0)` — documented in README).
- Listens for `postMessage({type:'hearts360:close'})` from the iframe so the in-app close button works.

**B. Inside `/embed/summary`** — same content as `/summary` but:
- Detects `?embed=1` (or route prefix) and:
  - Removes the centered max-width frame and outer margins.
  - Adds a small header row with a close button that posts `{type:'hearts360:close'}` to `window.parent`.
  - Disables the sticky page background so it inherits the panel's surface.

### 5. In-app side panel (when not embedded)
For users on this Lovable app directly (not on hearts360), clicking "View District summary" on the Home card opens the same panel **inside this app**:
- Reusable `<SidePanel />` component (push layout, not overlay): grid with main column + panel column.
- Drag-resizable divider on the left edge of the panel.
- Width persisted in `localStorage` under `hearts360.panelWidth`.
- Close button collapses the panel column to 0.
- On viewports `< 768 px`, panel becomes a full-width overlay drawer (still closeable) — push layout would crush content.

### 6. Files

**New**
- `src/pages/Home.tsx` — minimal shell with Dashboard card.
- `src/pages/EmbedSummary.tsx` — wraps existing summary content for iframe use.
- `src/components/DashboardCard.tsx` — the small card.
- `src/components/SidePanel.tsx` — push panel + resizer + persisted width.
- `src/hooks/useEmbedded.ts` — detects `?embed=1` / iframe context.
- `public/embed.js` — vanilla JS loader for external sites.
- `public/embed-demo.html` — small demo page showing how hearts360 would include the script (for QA + docs).
- `README-embed.md` — copy-paste integration snippet for the hearts360 repo.

**Modified**
- `src/App.tsx` — add `/summary`, `/embed/summary`, `/embed/dashboard-card` routes; `/` now renders `Home`.
- `src/pages/Index.tsx` — extract its body into a `<DistrictSummary />` component reused by `/summary` and `/embed/summary` (no behavior changes).
- `index.html` — ensure no `X-Frame-Options` blockers; allow framing.

**Unchanged**
- All existing facility data, FacilityCard, StatusTag, Sparkline, sentiment logic, dismiss/pin behavior.

## Hearts360 repo integration (what they paste)

```html
<!-- in hearts360 site layout -->
<div id="hearts360-panel"></div>
<script src="https://hearts360ai.lovable.app/embed.js" defer></script>
<style>
  body { padding-right: var(--hearts360-panel-width, 0); transition: padding-right .15s; }
</style>
```

To open from any button on hearts360:
```js
window.Hearts360Panel.open();   // .close(), .toggle()
```

## Notes / decisions

- **Push, not overlay** — matches request; iframe approach keeps this app's bundle isolated from hearts360's stack.
- **Resizing** — left-edge drag handle; 6 px hit area, cursor `col-resize`, width clamped and persisted.
- **No backend / auth changes.** All data stays in `src/data/facilities.ts`.
- **Memory** — will save the new "right-side push panel + iframe embed" pattern to `mem://features/embed-panel` after implementation so future changes respect it.

