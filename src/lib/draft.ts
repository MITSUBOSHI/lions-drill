import { draftByYearMap } from "@/data/draft";
import { DraftPick, DraftYear } from "@/types/DraftPick";
import { TEAM } from "@/config/team";

export function draftByYear(year: DraftYear): DraftPick[] {
  return draftByYearMap[year];
}

export function allDraftPicks(): DraftPick[] {
  return Object.values(draftByYearMap).flat();
}

/** NPB公式ドラフトページのURLを、年度ごとの球団コード変更も含めて返す。 */
export function draftSourceUrl(year: DraftYear): string {
  const npb = TEAM.npb as typeof TEAM.npb & {
    draftUrlTemplateOverrides?: Array<{
      from: number;
      to: number;
      template: string;
    }>;
  };
  const override = (npb.draftUrlTemplateOverrides ?? []).find(
    ({ from, to }) => year >= from && year <= to,
  );
  const template = override?.template ?? npb.draftUrlTemplate;

  return template.replace("{year}", String(year));
}
