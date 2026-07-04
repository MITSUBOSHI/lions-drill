import { draftByYearMap } from "@/data/draft";
import { DraftPick, DraftYear } from "@/types/DraftPick";

export function draftByYear(year: DraftYear): DraftPick[] {
  return draftByYearMap[year];
}

export function allDraftPicks(): DraftPick[] {
  return Object.values(draftByYearMap).flat();
}
