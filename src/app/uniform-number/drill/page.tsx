import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function DrillRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/number-drill/${maxYear}`);
  return null;
}
