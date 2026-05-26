import { redirect } from "next/navigation";
import { draftYears } from "@/constants/draft";

const maxYear = Math.max(...draftYears);

export default function DraftPage() {
  redirect(`/draft/${maxYear}`);
}
