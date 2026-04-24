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
| `data-src` | `/embed/summary?embed=1` (same origin as the script) | Override the iframe URL |
| `data-width` | `460` | Initial panel width in px |
| `data-auto-open` | `false` | Open the panel as soon as the script loads |

## 5. Just the Dashboard card

If hearts360 only wants the small card (not the panel), embed this URL in an
iframe directly:

```html
<iframe src="https://hearts360ai.lovable.app/embed/dashboard-card?embed=1"
        style="width:100%;max-width:420px;height:340px;border:0"></iframe>
```

The card posts `{type:'hearts360:facility', id}` and `{type:'hearts360:open'}`
messages to the host so you can wire your own behavior.

## 6. Try it locally

Open `/embed-demo.html` on this app to see the integration in action.
