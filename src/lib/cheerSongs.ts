import pitcherSongs from "@/data/cheer-songs/pitcher.json";
import individualBatterSongs from "@/data/cheer-songs/individual-batter.json";
import commonBatterSongs from "@/data/cheer-songs/common-batter.json";
import managerSongs from "@/data/cheer-songs/manager.json";
import anthemSongs from "@/data/cheer-songs/anthem.json";
import chanceSongs from "@/data/cheer-songs/chance.json";
import { CheerSongType } from "@/types/CheerSong";

const allSongs: CheerSongType[] = [
  ...(pitcherSongs as CheerSongType[]),
  ...(individualBatterSongs as CheerSongType[]),
  ...(commonBatterSongs as CheerSongType[]),
  ...(managerSongs as CheerSongType[]),
  ...(chanceSongs as CheerSongType[]),
  ...(anthemSongs as CheerSongType[]),
];

export const cheerSongYears: number[] = [
  ...new Set(allSongs.map((s) => s.year).filter((y): y is number => y != null)),
].sort((a, b) => a - b);

export function cheerSongsByYear(year: number): CheerSongType[] {
  return allSongs.filter((s) => s.year === year || s.year == null);
}
