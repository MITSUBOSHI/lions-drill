import type { Metadata } from "next";
import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { Year } from "@/types/Player";
import NumberCounter from "@/components/number-count/NumberCounter";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import { describe } from "@/config/team";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: Year }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year}年 背番号タイマー`,
    description: describe("numberCount", { year }),
  };
}

export async function generateStaticParams() {
  return registeredYears.map((y) => ({ year: y.toString() }));
}

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
