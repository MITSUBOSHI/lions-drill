import type { Metadata } from "next";
import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { cheerSongsByYear } from "@/lib/cheerSongs";
import { Year } from "@/types/Player";
import PlayerTable from "@/components/player-table/PlayerTable";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import { describe, TEAM } from "@/config/team";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: Year }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year}年 選手名鑑`,
    description: describe("playerDirectory", { year }),
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
  const cheerSongNumbers = new Set<string>();
  if (TEAM.features.cheerSongs) {
    const songs = cheerSongsByYear(currentYear);
    for (const song of songs) {
      if (song.playerNumber) cheerSongNumbers.add(song.playerNumber);
      if (song.applicablePlayers) {
        for (const p of song.applicablePlayers) cheerSongNumbers.add(p.number);
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="選手名鑑" reading="せんしゅめいかん" />
      <YearSelector currentYear={currentYear} baseUrl="/player-directory" />
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <PlayerTable
          players={players}
          year={currentYear}
          cheerSongNumbers={cheerSongNumbers}
        />
      </div>
    </div>
  );
}
