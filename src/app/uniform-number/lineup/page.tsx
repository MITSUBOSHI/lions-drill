import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function LineupRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/lineup-maker/${maxYear}`);
  return null;
}
