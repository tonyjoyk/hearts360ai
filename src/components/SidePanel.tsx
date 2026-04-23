import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE_KEY = "hearts360.panelWidth";
const MIN_WIDTH = 320;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 460;

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function readWidth(): number {
  try {
    const v = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(v) && v >= MIN_WIDTH && v <= MAX_WIDTH) return v;
  } catch {}
  return DEFAULT_WIDTH;
}

/**
 * Right-side push panel with a drag-resizable left edge. On viewports
 * narrower than 768px it switches to a full-width overlay drawer because
 * pushing would crush the main content. Width is persisted to localStorage.
 */
export function SidePanel({ open, onClose, children }: Props) {
  const [width, setWidth] = useState<number>(readWidth);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const draggingRef = useRef(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(width));
    } catch {}
  }, [width]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = window.innerWidth - ev.clientX;
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, next)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  if (!open) return null;

  // Mobile: full-width overlay
  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          role="dialog"
          aria-label="District summary"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] border-l bg-surface shadow-xl"
        >
          <div className="h-full overflow-y-auto">{children}</div>
        </aside>
      </>
    );
  }

  // Desktop: push panel rendered as fixed pane; the host layout reserves
  // padding-right via --hearts360-panel-width (set below).
  return (
    <aside
      role="region"
      aria-label="District summary"
      className="fixed inset-y-0 right-0 z-40 flex border-l bg-surface shadow-[0_0_0_1px_hsl(var(--border))]"
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onMouseDown={onMouseDown}
        className="group absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize"
      >
        <div className="mx-auto h-full w-px bg-border transition-colors group-hover:bg-border-strong" />
      </div>
      <div className="h-full w-full overflow-y-auto">{children}</div>
    </aside>
  );
}

export const SIDE_PANEL_WIDTHS = { MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH, readWidth };
