import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";
import { yearStaticParams } from "@/lib/yearPages";

export const generateStaticParams = () => yearStaticParams(registeredYears);

export default async function Page({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  redirect(`/player-directory/${year}`);
}
