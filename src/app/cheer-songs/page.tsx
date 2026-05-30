import { redirect, notFound } from "next/navigation";
import { cheerSongYears } from "@/lib/cheerSongs";
import { TEAM } from "@/config/team";

export default function CheerSongsRedirect() {
  if (!TEAM.features.cheerSongs || cheerSongYears.length === 0) {
    notFound();
  }
  const maxYear = Math.max(...cheerSongYears);
  redirect(`/cheer-songs/${maxYear}`);
}
