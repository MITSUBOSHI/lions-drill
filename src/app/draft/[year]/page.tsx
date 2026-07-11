import { draftYears } from "@/constants/draft";
import { draftByYear } from "@/lib/draft";
import { DraftYear } from "@/types/DraftPick";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import DraftPageClient from "@/components/draft/DraftPageClient";
import { yearMetadata, yearStaticParams } from "@/lib/yearPages";

export const generateMetadata = yearMetadata("ドラフト一覧", "draft");

export const generateStaticParams = () => yearStaticParams(draftYears);

export default async function Page({
  params,
}: {
  params: Promise<{ year: DraftYear }>;
}) {
  const { year } = await params;
  const currentYear = Number(year) as DraftYear;
  const picks = draftByYear(currentYear);

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="ドラフト一覧" reading="どらふといちらん" />
      <YearSelector
        currentYear={currentYear}
        baseUrl="/draft"
        years={draftYears}
      />
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <DraftPageClient singleYearPicks={picks} year={currentYear} />
      </div>
    </div>
  );
}
