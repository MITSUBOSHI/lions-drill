import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function NumberDrillRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/number-drill/${maxYear}`);
  return null;
}
