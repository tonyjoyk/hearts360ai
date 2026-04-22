import { useEffect, useState } from "react";

const KEY = "facility-review.field-context.v1";
const VISITED_KEY = "facility-review.visited.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function useFieldContext() {
  const [map, setMap] = useState<Record<string, string>>(() => read(KEY, {}));
  useEffect(() => write(KEY, map), [map]);
  return {
    getContext: (id: string) => map[id] ?? "",
    setContext: (id: string, value: string) => setMap((m) => ({ ...m, [id]: value })),
    clearContext: (id: string) => setMap((m) => { const n = { ...m }; delete n[id]; return n; }),
  };
}

export function useVisited() {
  const [map, setMap] = useState<Record<string, string>>(() => read(VISITED_KEY, {}));
  useEffect(() => write(VISITED_KEY, map), [map]);
  return {
    isVisited: (id: string) => Boolean(map[id]),
    visitedAt: (id: string) => map[id],
    markVisited: (id: string) => setMap((m) => ({ ...m, [id]: new Date().toISOString() })),
    clearVisited: (id: string) => setMap((m) => { const n = { ...m }; delete n[id]; return n; }),
  };
}
