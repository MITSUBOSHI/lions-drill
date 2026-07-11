import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";
import { latestYear } from "@/lib/yearPages";

export default function NumberCountRedirect() {
  redirect(`/number-count/${latestYear(registeredYears)}`);
}
