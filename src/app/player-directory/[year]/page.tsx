import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { cheerSongNumbersByYear } from "@/lib/cheerSongs";
import { Year } from "@/types/Player";
import PlayerTable from "@/components/player-table/PlayerTable";
import YearSelector from "@/components/common/YearSelector";
import PageTitle from "@/components/common/PageTitle";
import { yearMetadata, yearStaticParams } from "@/lib/yearPages";

export const generateMetadata = yearMetadata("選手名鑑", "playerDirectory");

export const generateStaticParams = () => yearStaticParams(registeredYears);

export default async function Page({
  params,
}: {
  params: Promise<{ year: Year }>;
}) {
  const { year } = await params;
  const currentYear = Number(year) as Year;
  const players = playersByYear(currentYear);
  const cheerSongNumbers = cheerSongNumbersByYear(currentYear);

  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle title="選手名鑑" reading="せんしゅめいかん" />
      <YearSelector currentYear={currentYear} baseUrl="/player-directory" />
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <PlayerTable
          players={players}
          year={currentYear}
          cheerSongNumbers={cheerSongNumbers}
        />
      </div>
    </div>
  );
}
