import { useState, useCallback } from "react";
import { load, save, uid } from "@/lib/storage";
import type { BodyWeightEntry } from "@/lib/types";

const KEY = "body_weight";

function loadEntries(): BodyWeightEntry[] {
  return load<BodyWeightEntry[]>(KEY, []).sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}

function saveEntries(entries: BodyWeightEntry[]) {
  save(KEY, entries);
}

export function useBodyWeight() {
  const [entries, setEntries] = useState<BodyWeightEntry[]>(loadEntries);

  const persist = useCallback((next: BodyWeightEntry[]) => {
    const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(sorted);
    saveEntries(sorted);
  }, []);

  const addEntry = useCallback(
    (date: string, weight_kg: number) => {
      const all = loadEntries();
      const existing = all.findIndex((e) => e.date === date);

      if (existing !== -1) {
        all[existing] = { ...all[existing], weight_kg };
      } else {
        all.push({
          id: uid(),
          user_id: "local",
          date,
          weight_kg,
        });
      }

      persist(all);
    },
    [persist],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(loadEntries().filter((e) => e.id !== id));
    },
    [persist],
  );

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;

  const trend =
    entries.length >= 2
      ? entries[entries.length - 1].weight_kg - entries[entries.length - 2].weight_kg
      : null;

  return {
    entries,
    loading: false,
    addEntry,
    deleteEntry,
    latest,
    trend,
    refresh: () => persist(loadEntries()),
  };
}
