"use client";

import { DraftPick, DraftYear } from "@/types/DraftPick";
import DraftFilters from "@/components/draft/DraftFilters";
import DraftTable from "@/components/draft/DraftTable";

type DraftPageClientProps = {
  singleYearPicks: DraftPick[];
  year: DraftYear;
};

export default function DraftPageClient({
  singleYearPicks,
  year,
}: DraftPageClientProps) {
  return (
    <DraftFilters singleYearPicks={singleYearPicks}>
      {(filteredPicks, showAllYears) => (
        <DraftTable
          picks={filteredPicks}
          showYearColumn={showAllYears}
          year={year}
        />
      )}
    </DraftFilters>
  );
}
