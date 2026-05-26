"use client";

import { useState } from "react";
import Ruby from "@/components/common/Ruby";
import { positionKanaMap } from "@/constants/draft";
import { DraftPick, DraftYear } from "@/types/DraftPick";

type DraftTableProps = {
  picks: DraftPick[];
  showYearColumn: boolean;
  year: DraftYear;
};

export default function DraftTable({
  picks,
  showYearColumn,
  year,
}: DraftTableProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  if (picks.length === 0) {
    return (
      <p className="text-center text-[var(--text-secondary)] py-8">
        該当する選手がいません
      </p>
    );
  }

  const toggleTooltip = (key: string) => {
    setOpenTooltip((prev) => (prev === key ? null : key));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--interactive-primary)] text-white sticky top-0 z-10">
            {showYearColumn && (
              <th className="px-3 py-2 text-left whitespace-nowrap">年</th>
            )}
            <th className="px-3 py-2 text-left whitespace-nowrap">種別</th>
            <th className="px-3 py-2 text-left whitespace-nowrap">順位</th>
            <th className="px-3 py-2 text-left whitespace-nowrap">名前</th>
            <th className="px-3 py-2 text-left whitespace-nowrap">
              ポジション
            </th>
            <th className="px-3 py-2 text-left whitespace-nowrap">出身</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((pick, index) => {
            const key = `${pick.year}-${pick.category}-${pick.round}`;
            return (
              <tr
                key={key}
                className={
                  index % 2 === 0
                    ? "bg-[var(--surface-card)]"
                    : "bg-[var(--surface-card-subtle)]"
                }
              >
                {showYearColumn && (
                  <td className="px-3 py-2 whitespace-nowrap">{pick.year}</td>
                )}
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`inline-block text-xs px-1.5 py-0.5 rounded ${
                      pick.category === "regular"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {pick.category === "regular" ? "支配下" : "育成"}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {pick.round}位
                    {pick.isLotteryLoss && (
                      <span className="relative">
                        <button
                          type="button"
                          className="inline-block text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-bold cursor-pointer border-none"
                          onClick={() => toggleTooltip(key)}
                          aria-label={`ハズレ1位の詳細${pick.lotteryTarget ? `: ${pick.lotteryTarget}を外して指名` : ""}`}
                        >
                          ハズレ
                        </button>
                        {openTooltip === key && pick.lotteryTarget && (
                          <span className="absolute left-0 top-full mt-1 z-20 whitespace-nowrap text-xs px-2 py-1 rounded shadow-lg bg-[var(--surface-card)] border border-[var(--border-card)] text-[var(--text-primary)]">
                            {pick.lotteryTarget}を外して指名
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  <Ruby reading={pick.name_kana}>{pick.name}</Ruby>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Ruby reading={positionKanaMap[pick.position] ?? ""}>
                    {pick.position}
                  </Ruby>
                </td>
                <td className="px-3 py-2">
                  <Ruby reading={pick.team_kana}>{pick.team}</Ruby>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-[var(--text-secondary)] mt-2 text-right">
        データソース:{" "}
        <a
          href={`https://draft.npb.jp/draft/${year}/draftlist_db.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          NPB公式ドラフト会議 ({year}年)
        </a>
      </p>
    </div>
  );
}
