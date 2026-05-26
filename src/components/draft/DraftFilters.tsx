"use client";

import { useState, useMemo, useCallback } from "react";
import { DraftPick } from "@/types/DraftPick";
import OptionGroup from "@/components/common/OptionGroup";

type DraftFiltersProps = {
  singleYearPicks: DraftPick[];
  allPicks: DraftPick[];
  children: (
    filteredPicks: DraftPick[],
    showAllYears: boolean,
  ) => React.ReactNode;
};

const roundOptions = [
  { value: "1", label: "1位" },
  { value: "2", label: "2位" },
  { value: "3", label: "3位" },
  { value: "4", label: "4位" },
  { value: "5", label: "5位" },
  { value: "6", label: "6位" },
  { value: "7", label: "7位以降" },
];

const categoryOptions = [
  { value: "all", label: "全て" },
  { value: "regular", label: "支配下" },
  { value: "development", label: "育成" },
];

const positionOptions = [
  { value: "投手", label: "投手" },
  { value: "捕手", label: "捕手" },
  { value: "内野手", label: "内野手" },
  { value: "外野手", label: "外野手" },
];

export default function DraftFilters({
  singleYearPicks,
  allPicks,
  children,
}: DraftFiltersProps) {
  const [showAllYears, setShowAllYears] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

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

  const filteredPicks = useMemo(() => {
    const basePicks = showAllYears ? allPicks : singleYearPicks;

    return basePicks.filter((pick) => {
      if (selectedRounds.length > 0) {
        const roundStr = pick.round <= 6 ? String(pick.round) : "7";
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
  }, [
    showAllYears,
    allPicks,
    singleYearPicks,
    selectedRounds,
    selectedCategory,
    selectedPositions,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 bg-[var(--surface-card-subtle)] rounded-lg border border-[var(--border-card)]">
        <div className="flex items-center gap-3">
          <button
            className={`text-sm rounded-full px-4 py-1.5 border cursor-pointer transition-colors ${
              showAllYears
                ? "bg-[var(--interactive-primary)] text-white border-[var(--interactive-primary)]"
                : "bg-transparent text-[var(--interactive-primary)] border-[var(--interactive-primary)]"
            }`}
            onClick={() => setShowAllYears(!showAllYears)}
          >
            全年表示
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            順位
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
            種別
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
        {filteredPicks.length}件
      </p>

      {children(filteredPicks, showAllYears)}
    </div>
  );
}
