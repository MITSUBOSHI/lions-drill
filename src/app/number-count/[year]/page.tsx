import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { Year } from "@/types/Player";
import NumberCounter from "@/components/number-count/NumberCounter";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import { yearMetadata, yearStaticParams } from "@/lib/yearPages";

export const generateMetadata = yearMetadata("背番号タイマー", "numberCount");

export const generateStaticParams = () => yearStaticParams(registeredYears);

export default async function Page({
  params,
}: {
  params: Promise<{ year: Year }>;
}) {
  const { year } = await params;
  const currentYear = Number(year) as Year;
  const players = playersByYear(currentYear);

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="背番号タイマー" reading="せばんごうたいまー" />
      <YearSelector currentYear={currentYear} baseUrl="/number-count" />
      <div className="w-full max-w-full md:max-w-[500px] px-4">
        <NumberCounter players={players} />
      </div>
    </div>
  );
}
