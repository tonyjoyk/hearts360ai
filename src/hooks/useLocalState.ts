import { useEffect, useState } from "react";

const CONTEXT_KEY = "fr.context.v2";
const VISITED_KEY = "fr.visited.v2";
const PINNED_KEY = "fr.pinned.v2";
const DISMISSED_KEY = "fr.dismissed.v2";

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
  const [map, setMap] = useState<Record<string, string>>(() => read(CONTEXT_KEY, {}));
  useEffect(() => write(CONTEXT_KEY, map), [map]);
  return {
    getContext: (id: string) => map[id] ?? "",
    setContext: (id: string, value: string) =>
      setMap((m) => {
        const n = { ...m };
        if (value.trim()) n[id] = value;
        else delete n[id];
        return n;
      }),
  };
}

export function useVisited() {
  const [map, setMap] = useState<Record<string, string>>(() => read(VISITED_KEY, {}));
  useEffect(() => write(VISITED_KEY, map), [map]);
  return {
    isVisited: (id: string) => Boolean(map[id]),
    toggleVisited: (id: string) =>
      setMap((m) => {
        const n = { ...m };
        if (n[id]) delete n[id];
        else n[id] = new Date().toISOString();
        return n;
      }),
  };
}

function useStringSet(key: string) {
  const [set, setSet] = useState<Set<string>>(() => new Set(read<string[]>(key, [])));
  useEffect(() => write(key, Array.from(set)), [key, set]);
  return {
    has: (id: string) => set.has(id),
    toggle: (id: string) =>
      setSet((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      }),
    add: (id: string) =>
      setSet((s) => {
        const n = new Set(s);
        n.add(id);
        return n;
      }),
    remove: (id: string) =>
      setSet((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      }),
    values: () => Array.from(set),
  };
}

export function usePinned() {
  return useStringSet(PINNED_KEY);
}

export function useDismissed() {
  return useStringSet(DISMISSED_KEY);
}
