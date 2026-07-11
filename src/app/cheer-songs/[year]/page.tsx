import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Year } from "@/types/Player";
import YearSelector from "@/components/common/YearSelector";
import CheerSongViewer from "@/components/cheer-songs/CheerSongViewer";
import PageTitle from "@/components/common/PageTitle";
import { cheerSongsByYear, cheerSongYears } from "@/lib/cheerSongs";
import { TEAM } from "@/config/team";
import { yearMetadata, yearStaticParams } from "@/lib/yearPages";

export const generateMetadata = yearMetadata("応援歌", "cheerSongs");

export const generateStaticParams = () =>
  TEAM.features.cheerSongs ? yearStaticParams(cheerSongYears) : [];

export default async function Page({
  params,
}: {
  params: Promise<{ year: Year }>;
}) {
  if (!TEAM.features.cheerSongs) {
    notFound();
  }
  const { year } = await params;
  const currentYear = Number(year) as Year;
  // その年に在籍する選手の応援歌のみが返る（背番号・ふりがなもその年の名簿に揃う）
  const songs = cheerSongsByYear(currentYear);

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="応援歌" reading="おうえんか" />
      <YearSelector
        currentYear={currentYear}
        baseUrl="/cheer-songs"
        years={cheerSongYears}
      />
      <div className="w-full max-w-full md:max-w-[800px] mx-auto px-4">
        {songs.length > 0 ? (
          <Suspense>
            <CheerSongViewer songs={songs} year={currentYear} />
          </Suspense>
        ) : (
          <p className="text-[var(--text-secondary)] text-lg">
            {currentYear}年の応援歌データはまだありません。
          </p>
        )}
      </div>
    </div>
  );
}
