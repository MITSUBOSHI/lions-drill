"use client";

import { useState, useMemo, useCallback } from "react";
import { DraftPick } from "@/types/DraftPick";
import OptionGroup from "@/components/common/OptionGroup";
import Ruby from "@/components/common/Ruby";

type DraftFiltersProps = {
  singleYearPicks: DraftPick[];
  children: (
    filteredPicks: DraftPick[],
    showAllYears: boolean,
  ) => React.ReactNode;
};

const rankLabel = (n: number) => (
  <>
    {n}
    <Ruby reading="い">位</Ruby>
  </>
);

const baseRoundOptions = [
  { value: "1", label: rankLabel(1) },
  { value: "2", label: rankLabel(2) },
  { value: "3", label: rankLabel(3) },
  { value: "4", label: rankLabel(4) },
  { value: "5", label: rankLabel(5) },
  { value: "6", label: rankLabel(6) },
  {
    value: "7",
    label: (
      <>
        {rankLabel(7)}
        <Ruby reading="いこう">以降</Ruby>
      </>
    ),
  },
];

// round=0（自由獲得枠・希望入団枠など巡目なしの特別枠）の絞り込み値
const OTHER_ROUND = "other";

function roundToFilterValue(round: number): string {
  if (round <= 0) return OTHER_ROUND;
  if (round <= 6) return String(round);
  return "7";
}

const categoryOptions = [
  {
    value: "all",
    label: (
      <>
        <Ruby reading="すべ">全</Ruby>て
      </>
    ),
  },
  { value: "regular", label: <Ruby reading="ほんしめい">本指名</Ruby> },
  { value: "development", label: <Ruby reading="いくせい">育成</Ruby> },
];

const positionOptions = [
  { value: "投手", label: <Ruby reading="とうしゅ">投手</Ruby> },
  { value: "捕手", label: <Ruby reading="ほしゅ">捕手</Ruby> },
  { value: "内野手", label: <Ruby reading="ないやしゅ">内野手</Ruby> },
  { value: "外野手", label: <Ruby reading="がいやしゅ">外野手</Ruby> },
];

export default function DraftFilters({
  singleYearPicks,
  children,
}: DraftFiltersProps) {
  const [showAllYears, setShowAllYears] = useState(false);
  // 全年分のデータは大きいため、初期HTMLには含めず「全年表示」時に遅延ロードする
  const [allPicks, setAllPicks] = useState<DraftPick[] | null>(null);
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const handleToggleAllYears = useCallback(() => {
    setShowAllYears((prev) => !prev);
    if (!allPicks) {
      import("@/lib/draft").then((mod) => setAllPicks(mod.allDraftPicks()));
    }
  }, [allPicks]);

  const handleRoundChange = useCallback((value: string) => {
    setSelectedRounds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const handlePositionChange = useCallback((value: string) => {
    setSelectedPositions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const basePicks =
    showAllYears && allPicks !== null ? allPicks : singleYearPicks;

  const roundOptions = useMemo(() => {
    const hasOther = basePicks.some((p) => p.round <= 0);
    return hasOther
      ? [
          ...baseRoundOptions,
          {
            value: OTHER_ROUND,
            label: (
              <>
                その<Ruby reading="た">他</Ruby>
              </>
            ),
          },
        ]
      : baseRoundOptions;
  }, [basePicks]);

  const filteredPicks = useMemo(() => {
    return basePicks.filter((pick) => {
      if (selectedRounds.length > 0) {
        const roundStr = roundToFilterValue(pick.round);
        if (!selectedRounds.includes(roundStr)) return false;
      }

      if (selectedCategory !== "all" && pick.category !== selectedCategory) {
        return false;
      }

      if (
        selectedPositions.length > 0 &&
        !selectedPositions.includes(pick.position)
      ) {
        return false;
      }

      return true;
    });
  }, [basePicks, selectedRounds, selectedCategory, selectedPositions]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 bg-[var(--surface-card-subtle)] rounded-lg border border-[var(--border-card)]">
        <div className="flex items-center gap-3">
          <button
            className={`text-sm rounded-full px-4 py-1.5 min-h-11 border cursor-pointer transition-colors ${
              showAllYears
                ? "bg-[var(--interactive-primary)] text-white border-[var(--interactive-primary)]"
                : "bg-transparent text-[var(--interactive-primary)] border-[var(--interactive-primary)]"
            }`}
            onClick={handleToggleAllYears}
            aria-pressed={showAllYears}
          >
            <Ruby reading="ぜんねんひょうじ">全年表示</Ruby>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            <Ruby reading="じゅんい">順位</Ruby>
          </p>
          <OptionGroup
            name="round"
            options={roundOptions}
            selectedValues={selectedRounds}
            onChange={handleRoundChange}
            multiple
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            <Ruby reading="しゅべつ">種別</Ruby>
          </p>
          <OptionGroup
            name="category"
            options={categoryOptions}
            selectedValues={[selectedCategory]}
            onChange={setSelectedCategory}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            ポジション
          </p>
          <OptionGroup
            name="position"
            options={positionOptions}
            selectedValues={selectedPositions}
            onChange={handlePositionChange}
            multiple
          />
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        {filteredPicks.length}
        <Ruby reading="けん">件</Ruby>
      </p>

      {children(filteredPicks, showAllYears)}
    </div>
  );
}
