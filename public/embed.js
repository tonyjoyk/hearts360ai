/**
 * hearts360 / Lovable embed loader
 * --------------------------------------------------------------------------
 * Drop-in script that mounts the District summary tool as a right-side push
 * panel on any host site (e.g. simpledotorg/hearts360).
 *
 * Usage on the host:
 *
 *   <script src="https://hearts360ai.lovable.app/embed.js" defer></script>
 *   <style>
 *     body { padding-right: var(--hearts360-panel-width, 0);
 *            transition: padding-right .15s ease; }
 *   </style>
 *
 * Then from any button on the host page:
 *
 *   window.Hearts360Panel.open();
 *   window.Hearts360Panel.close();
 *   window.Hearts360Panel.toggle();
 *
 * Optional script attributes:
 *   data-src    Override the iframe URL (default: same origin as this script + /embed/summary?embed=1)
 *   data-width  Initial panel width in px (default: 460)
 *   data-auto-open   Set to "true" to open immediately on load
 */
(function () {
  if (window.Hearts360Panel) return; // singleton

  var script = document.currentScript;
  var origin = (function () {
    try { return new URL(script.src).origin; } catch (e) { return ""; }
  })();

  var IFRAME_SRC =
    (script && script.getAttribute("data-src")) ||
    origin + "/embed/summary?embed=1";

  var STORAGE_KEY = "hearts360.panelWidth";
  var MIN_WIDTH = 320;
  var MAX_WIDTH = 720;
  var DEFAULT_WIDTH = parseInt(
    (script && script.getAttribute("data-width")) || "460",
    10
  );

  function readWidth() {
    try {
      var v = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      if (v >= MIN_WIDTH && v <= MAX_WIDTH) return v;
    } catch (e) {}
    return DEFAULT_WIDTH;
  }
  function writeWidth(w) {
    try { localStorage.setItem(STORAGE_KEY, String(w)); } catch (e) {}
  }

  var width = readWidth();
  var open = false;
  var root, iframe, handle;

  function setHostPadding(px) {
    document.documentElement.style.setProperty(
      "--hearts360-panel-width",
      px ? px + "px" : "0px"
    );
  }

  function build() {
    root = document.createElement("aside");
    root.id = "hearts360-panel-root";
    root.setAttribute("aria-label", "District summary");
    root.style.cssText = [
      "position:fixed",
      "top:0",
      "right:0",
      "bottom:0",
      "width:" + width + "px",
      "background:#fff",
      "border-left:1px solid rgba(0,0,0,0.12)",
      "box-shadow:-4px 0 16px rgba(0,0,0,0.06)",
      "z-index:2147483000",
      "display:none",
      "transform:translateX(0)",
      "font-family:inherit",
    ].join(";");

    // Resize handle
    handle = document.createElement("div");
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-label", "Resize panel");
    handle.style.cssText = [
      "position:absolute",
      "top:0",
      "left:-3px",
      "width:6px",
      "height:100%",
      "cursor:col-resize",
      "z-index:1",
      "background:transparent",
    ].join(";");
    handle.addEventListener("mousedown", onDragStart);
    root.appendChild(handle);

    iframe = document.createElement("iframe");
    iframe.src = IFRAME_SRC;
    iframe.title = "District summary";
    iframe.style.cssText = [
      "width:100%",
      "height:100%",
      "border:0",
      "display:block",
      "background:#fff",
    ].join(";");
    root.appendChild(iframe);

    document.body.appendChild(root);
  }

  function onDragStart(e) {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    // Block iframe from swallowing mouse events while dragging
    iframe.style.pointerEvents = "none";

    function onMove(ev) {
      var next = window.innerWidth - ev.clientX;
      if (next < MIN_WIDTH) next = MIN_WIDTH;
      if (next > MAX_WIDTH) next = MAX_WIDTH;
      width = next;
      root.style.width = width + "px";
      if (open) setHostPadding(width);
    }
    function onUp() {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      iframe.style.pointerEvents = "";
      writeWidth(width);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function api() {
    return {
      open: function () {
        if (!root) build();
        open = true;
        root.style.display = "block";
        setHostPadding(window.innerWidth >= 768 ? width : 0);
      },
      close: function () {
        open = false;
        if (root) root.style.display = "none";
        setHostPadding(0);
      },
      toggle: function () {
        if (open) this.close();
        else this.open();
      },
      isOpen: function () { return open; },
    };
  }

  window.Hearts360Panel = api();

  // Listen for messages from the embedded app
  window.addEventListener("message", function (event) {
    if (!event.data || typeof event.data !== "object") return;
    if (event.data.type === "hearts360:close") {
      window.Hearts360Panel.close();
    }
    if (event.data.type === "hearts360:open") {
      window.Hearts360Panel.open();
    }
  });

  // Reset push padding on viewport changes (mobile uses overlay, no padding)
  window.addEventListener("resize", function () {
    if (!open) return;
    setHostPadding(window.innerWidth >= 768 ? width : 0);
  });

  // Optional auto-open
  if (script && script.getAttribute("data-auto-open") === "true") {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      window.Hearts360Panel.open();
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        window.Hearts360Panel.open();
      });
    }
  }
})();
