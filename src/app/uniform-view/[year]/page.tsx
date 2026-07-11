import { Suspense } from "react";
import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { cheerSongNumbersByYear } from "@/lib/cheerSongs";
import { Year } from "@/types/Player";
import UniformViewer from "@/components/uniform-view/UniformViewer";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import { yearMetadata, yearStaticParams } from "@/lib/yearPages";

export const generateMetadata = yearMetadata(
  "ユニフォームビュー",
  "uniformView",
);

export const generateStaticParams = () => yearStaticParams(registeredYears);

export default async function Page({
  params,
}: {
  params: Promise<{ year: Year }>;
}) {
  const { year } = await params;
  const currentYear = Number(year) as Year;
  const players = playersByYear(currentYear);
  const cheerSongNumbers = cheerSongNumbersByYear(currentYear);

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="ユニフォームビュー" reading="ゆにふぉーむびゅー" />
      <YearSelector currentYear={currentYear} baseUrl="/uniform-view" />
      <div className="w-full max-w-full md:max-w-[500px] px-4">
        <Suspense>
          <UniformViewer
            players={players}
            year={currentYear}
            cheerSongNumbers={cheerSongNumbers}
          />
        </Suspense>
      </div>
    </div>
  );
}
