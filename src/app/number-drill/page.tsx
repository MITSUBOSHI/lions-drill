import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";
import { latestYear } from "@/lib/yearPages";

export default function NumberDrillRedirect() {
  redirect(`/number-drill/${latestYear(registeredYears)}`);
}
