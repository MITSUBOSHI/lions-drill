import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";

export default function UniformViewRedirect() {
  const maxYear = Math.max(...registeredYears);
  redirect(`/uniform-view/${maxYear}`);
  return null;
}
