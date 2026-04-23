/**
 * Detects whether the app is running inside an iframe embed (e.g. mounted
 * via /public/embed.js on an external host like hearts360). Used by pages
 * to drop their outer page chrome and to send messages to window.parent.
 */
export function useEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("embed") === "1") return true;
  } catch {}
  // Also treat "in an iframe" as embedded for safety
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function postToHost(message: unknown) {
  try {
    window.parent?.postMessage(message, "*");
  } catch {}
}
