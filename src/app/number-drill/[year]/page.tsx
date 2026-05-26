import type { Metadata } from "next";
import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { Year } from "@/types/Player";
import Question from "@/components/number-uniform/Question";
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
    title: `${year}年 背番号計算ドリル`,
    description: describe("numberDrill", { year }),
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
      <PageTitle title="背番号計算ドリル" reading="せばんごうけいさんどりる" />
      <YearSelector currentYear={currentYear} baseUrl="/number-drill" />
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <Question players={players} />
      </div>
    </div>
  );
}
