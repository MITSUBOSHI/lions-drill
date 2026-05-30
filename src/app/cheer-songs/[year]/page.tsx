import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Year } from "@/types/Player";
import YearSelector from "@/components/common/YearSelector";
import CheerSongViewer from "@/components/cheer-songs/CheerSongViewer";
import PageTitle from "@/components/common/PageTitle";
import { cheerSongsByYear, cheerSongYears } from "@/lib/cheerSongs";
import { playersByYear } from "@/lib/players";
import { describe, TEAM } from "@/config/team";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: Year }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year}年 応援歌`,
    description: describe("cheerSongs", { year }),
  };
}

export async function generateStaticParams() {
  if (!TEAM.features.cheerSongs) return [];
  return cheerSongYears.map((y) => ({ year: y.toString() }));
}

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
  const players = playersByYear(currentYear);
  const songs = cheerSongsByYear(currentYear).map((song) => {
    if (song.playerNumber) {
      const player = players.find((p) => p.number_disp === song.playerNumber);
      if (player) {
        return { ...song, playerNameKana: player.name_kana };
      }
    }
    return song;
  });

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
