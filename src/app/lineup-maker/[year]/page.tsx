import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { Year } from "@/types/Player";
import LineupCreator from "@/components/lineup/LineupCreator";
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
    title: `${year}年 スタメン作成`,
    description: describe("lineupMaker", { year }),
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
      <PageTitle title="スタメン作成" reading="すためんさくせい" />
      <YearSelector currentYear={currentYear} baseUrl="/lineup-maker" />
      <div className="w-full max-w-[800px] px-4">
        <Link
          href="/lineup-custom-maker"
          className="inline-block text-sm underline text-[var(--interactive-primary)] hover:opacity-80"
        >
          自由入力でスタメンを作成する →
        </Link>
      </div>
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <Suspense>
          <LineupCreator players={players} />
        </Suspense>
      </div>
    </div>
  );
}
