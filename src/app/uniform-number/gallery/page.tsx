import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function GalleryRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/player-directory/${maxYear}`);
  return null;
}
