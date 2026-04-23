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
 *   data-src    Override the iframe URL (default: HashRouter URL next to this script, see defaultSummaryIframeSrc)
 *   data-width  Initial panel width in px (default: 460)
 *   data-auto-open   Set to "true" to open immediately on load
 */
(function () {
  if (window.Hearts360Panel) return; // singleton

  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i].src || "";
      if (s.indexOf("hearts360-embed") !== -1 || s.indexOf("/embed.js") !== -1) {
        script = scripts[i];
        break;
      }
    }
  }
  var origin = (function () {
    try { return new URL(script.src).origin; } catch (e) { return ""; }
  })();

  /** Vite base is /tool/ and the app uses HashRouter — path routes like /embed/summary do not exist. */
  function defaultSummaryIframeSrc() {
    var fallback = "/tool/index.html#/embed/summary?embed=1";
    if (!script || !script.src) {
      try {
        return (typeof location !== "undefined" && location.origin
          ? location.origin
          : "") + fallback;
      } catch (e2) {
        return fallback;
      }
    }
    try {
      var u = new URL(script.src);
      var path = u.pathname;
      if (/\/embed\.js$/i.test(path)) {
        var dir = path.replace(/\/embed\.js$/i, "");
        if (!dir.endsWith("/")) dir += "/";
        return u.origin + dir + "index.html#/embed/summary?embed=1";
      }
      if (/hearts360-embed\.js$/i.test(path)) {
        return u.origin + "/tool/index.html#/embed/summary?embed=1";
      }
      return u.origin + fallback;
    } catch (e) {
      return (origin || "") + fallback;
    }
  }

  var IFRAME_SRC =
    (script && script.getAttribute("data-src")) ||
    defaultSummaryIframeSrc();

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

  function injectGripStyles() {
    if (document.getElementById("hearts360-panel-grip-styles")) return;
    var st = document.createElement("style");
    st.id = "hearts360-panel-grip-styles";
    st.textContent =
      "#hearts360-panel-root .hearts360-panel-resize-handle{" +
      "position:absolute;top:0;left:-5px;width:10px;height:100%;" +
      "cursor:col-resize;z-index:1;background:transparent;" +
      "}" +
      "#hearts360-panel-root .hearts360-panel-resize-grip{" +
      "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);" +
      "width:5px;height:34px;border-radius:999px;" +
      "background:rgba(75,85,99,0.92);opacity:0;pointer-events:none;" +
      "transition:opacity .15s ease;" +
      "box-shadow:0 0 0 1px rgba(255,255,255,.35);" +
      "}" +
      "#hearts360-panel-root .hearts360-panel-resize-handle:hover .hearts360-panel-resize-grip," +
      "#hearts360-panel-root .hearts360-panel-resize-handle.hearts360-panel-resize--dragging .hearts360-panel-resize-grip{" +
      "opacity:1;" +
      "}";
    document.head.appendChild(st);
  }

  function build() {
    injectGripStyles();
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
      "border-left:3px solid rgba(0,0,0,0.12)",
      "box-shadow:-4px 0 16px rgba(0,0,0,0.06)",
      "z-index:2147483000",
      "display:none",
      "transform:translateX(0)",
      "font-family:inherit",
    ].join(";");

    // Resize handle (+ centered grip affordance on hover)
    handle = document.createElement("div");
    handle.className = "hearts360-panel-resize-handle";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-label", "Resize panel");
    var grip = document.createElement("span");
    grip.className = "hearts360-panel-resize-grip";
    grip.setAttribute("aria-hidden", "true");
    handle.appendChild(grip);
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
    handle.classList.add("hearts360-panel-resize--dragging");
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
      handle.classList.remove("hearts360-panel-resize--dragging");
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
