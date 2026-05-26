import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function NumberCountRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/number-count/${maxYear}`);
  return null;
}
