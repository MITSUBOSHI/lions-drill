import { redirect, notFound } from "next/navigation";
import { cheerSongYears } from "@/lib/cheerSongs";
import { TEAM } from "@/config/team";
import { latestYear } from "@/lib/yearPages";

export default function CheerSongsRedirect() {
  if (!TEAM.features.cheerSongs || cheerSongYears.length === 0) {
    notFound();
  }
  redirect(`/cheer-songs/${latestYear(cheerSongYears)}`);
}
