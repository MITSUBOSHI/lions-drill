import type { Metadata } from "next";
import { draftYears } from "@/constants/draft";
import { draftByYear, allDraftPicks } from "@/lib/draft";
import { DraftYear } from "@/types/DraftPick";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import DraftPageClient from "@/components/draft/DraftPageClient";
import { describe } from "@/config/team";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: DraftYear }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year}年 ドラフト一覧`,
    description: describe("draft", { year }),
  };
}

export async function generateStaticParams() {
  return draftYears.map((y) => ({ year: y.toString() }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ year: DraftYear }>;
}) {
  const { year } = await params;
  const currentYear = Number(year) as DraftYear;
  const picks = draftByYear(currentYear);
  const allPicks = allDraftPicks();

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="ドラフト一覧" reading="どらふといちらん" />
      <YearSelector
        currentYear={currentYear}
        baseUrl="/draft"
        years={draftYears}
      />
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <DraftPageClient
          singleYearPicks={picks}
          allPicks={allPicks}
          year={currentYear}
        />
      </div>
    </div>
  );
}
