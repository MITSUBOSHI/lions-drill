import { TEAM } from "@/config/team";

const STORAGE_KEY = TEAM.storage.drillScoreKey;

export type DrillScoreRecord = {
  total: number;
  correct: number;
};

export function loadDrillScore(): DrillScoreRecord {
  if (typeof window === "undefined") return { total: 0, correct: 0 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed.total === "number" &&
        typeof parsed.correct === "number"
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { total: 0, correct: 0 };
}

export function saveDrillScore(record: DrillScoreRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export function resetDrillScore(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
