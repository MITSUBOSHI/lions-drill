import { redirect } from "next/navigation";
import { draftYears } from "@/constants/draft";
import { latestYear } from "@/lib/yearPages";

export default function DraftPage() {
  redirect(`/draft/${latestYear(draftYears)}`);
}
