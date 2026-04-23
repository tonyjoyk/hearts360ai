# Embedding the District summary in hearts360

This app exposes a tiny vanilla JS loader that mounts the District summary
tool as a **right-side push panel** on any host site, including the
[simpledotorg/hearts360](https://github.com/simpledotorg/hearts360) project.

## 1. Add one script tag and a CSS rule

```html
<script src="https://hearts360ai.lovable.app/embed.js" defer></script>
<style>
  /* Reserve space so the panel pushes content instead of covering it */
  body { padding-right: var(--hearts360-panel-width, 0);
         transition: padding-right .15s ease; }
</style>
```

## 2. Open / close from any button

```html
<button onclick="Hearts360Panel.open()">Open District summary</button>
<button onclick="Hearts360Panel.close()">Close</button>
<button onclick="Hearts360Panel.toggle()">Toggle</button>
```

## 3. Behavior

- **Push, not overlay** on viewports ≥ 768 px. Page content shifts left.
- **Overlay drawer** on smaller screens (push would crush content).
- **Drag the left edge** to resize. Width is clamped 320–720 px and persisted to `localStorage`.
- The panel's in-app close button (X) posts a `message` to the host, so closing from inside also dismisses the panel.

## 4. Optional script attributes

| Attribute | Default | Purpose |
|-----------|---------|---------|
| `data-src` | Resolved from script URL (see §6) | Override the iframe URL |
| `data-width` | `460` | Initial panel width in px |
| `data-auto-open` | `false` | Open the panel as soon as the script loads |

## 5. Just the Dashboard card

If hearts360 only wants the small card (not the panel), embed this URL in an
iframe directly:

```html
<iframe src="https://hearts360ai.lovable.app/tool/index.html#/embed/dashboard-card?embed=1"
        style="width:100%;max-width:420px;height:340px;border:0"></iframe>
```

The card posts `{type:'hearts360:facility', id}` and `{type:'hearts360:open'}`
messages to the host so you can wire your own behavior.

## 6. Self-host on hearts360.org (`/tool/`)

The app is built with Vite `base: '/tool/'` and **HashRouter** so it can live
on static hosting. Iframe and panel use hash URLs:

- Dashboard card: `/tool/index.html#/embed/dashboard-card?embed=1`
- Full summary (panel): `/tool/index.html#/embed/summary?embed=1`

After `npm run build`, copy `dist/` into the HEARTS360 repo under `tool/`.
Use **`npm run deploy:hearts360`** from this repo when `../hearts360` sits next
to `hearts360ai`.

## 7. Try it locally

1. From this repo run **`npm run dev`** (Vite listens on **port 8080**).
2. Open **`http://localhost:8080/tool/`** — the home shell (path reflects `base`).
3. Embeds and deep links use the **hash** (`#`), not a separate path:
   - Dashboard card: **`http://localhost:8080/tool/#/embed/dashboard-card?embed=1`**
   - District summary (panel route): **`http://localhost:8080/tool/#/embed/summary?embed=1`**
4. Panel demo page: **`http://localhost:8080/tool/embed-demo.html`** — click *Open District summary* to verify the iframe loads (script is `./embed.js` next to the demo page).

If a URL “does nothing” or shows 404: you probably omitted **`/tool/`**, forgot the **`#`**, or the dev server is not running.

## 8. Keeping the HEARTS360 template HTML card in sync with the panel

All district metrics and facility copy for the embedded panel come from **`src/data/facilities.ts`**
(`DISTRICT.stats`, `getNeedsAttention`, each facility’s **`cardInsights[0]`**, and **`StatusTag`** labels).

The React **`DashboardCard`** uses **`getOverviewCardModel()`** (`src/lib/overviewCardModel.ts`) so it always matches that source.

For the **static** `ds-card` block inside [simpledotorg/hearts360](https://github.com/simpledotorg/hearts360)
`index.html`, regenerate the metrics + facility list fragment after you change demo data:

```bash
npm run sync:hearts360-static-card
```

That writes **`../hearts360/overview-ds-card-district-data.generated.html`** (sibling repo). Paste its contents over the **`ds-metrics-wrap` … `ds-fac-list`** section in **`hearts360/index.html`**, or use it as a diff check. Sparklines stay as fixed SVG paths in that fragment (visual design, not tied to numeric series).

## 9. Shareable live URL

**GitHub Actions → GitHub Pages**

1. Repo **Settings → Pages**: set **Source** to **GitHub Actions** (not “Deploy from branch”).
2. Push to **`main`**; workflow **Deploy to GitHub Pages** (`.github/workflows/deploy-pages.yml`) builds with `VITE_BASE_PATH=/<repo>/` and publishes **`dist`**.
3. After the first successful run, the site is at **`https://<username>.github.io/<repo>/`** (for this repo: **`https://tonyjoyk.github.io/hearts360ai/`**). Use hash routes, e.g. **`…/hearts360ai/#/embed/summary?embed=1`**.

**Vercel:** Import the repo at [vercel.com](https://vercel.com); production builds set **`VERCEL=1`** so `vite.config.ts` uses **`base: "/"`**. **`vercel.json`** adds SPA rewrites. Example app URL: **`https://<project>.vercel.app`**.
