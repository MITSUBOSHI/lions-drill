import { draftSourceUrl } from "@/lib/draft";
import { TEAM } from "@/config/team";

describe("draftSourceUrl", () => {
  const npb = TEAM.npb as typeof TEAM.npb & {
    draftUrlTemplateOverrides?: Array<{
      from: number;
      to: number;
      template: string;
    }>;
  };

  it.each([2001, 2011, 2012, 2025] as const)(
    "%i年の球団別公式URLを返す",
    (year) => {
      const override = (npb.draftUrlTemplateOverrides ?? []).find(
        ({ from, to }) => year >= from && year <= to,
      );
      const expected = (override?.template ?? npb.draftUrlTemplate).replace(
        "{year}",
        String(year),
      );

      expect(draftSourceUrl(year)).toBe(expected);
    },
  );
});
