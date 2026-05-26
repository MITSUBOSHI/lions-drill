import { redirect } from "next/navigation";
import { registeredYears } from "@/constants/player";
import { Year } from "@/types/Player";

export async function generateStaticParams() {
  return registeredYears.map((y) => ({ year: y.toString() }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ year: Year }>;
}) {
  const { year } = await params;
  redirect(`/lineup-maker/${year}`);
  return null;
}
