import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function PlayerDirectoryRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/player-directory/${maxYear}`);
  return null;
}
