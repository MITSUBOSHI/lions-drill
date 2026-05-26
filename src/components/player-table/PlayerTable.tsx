"use client";

import { PlayerType } from "@/types/Player";
import { useState } from "react";
import Link from "next/link";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FiMusic } from "react-icons/fi";
import { GiClothes } from "react-icons/gi";
import { useFurigana } from "@/contexts/FuriganaContext";
import Ruby from "@/components/common/Ruby";

type SortOrder = "asc" | "desc" | null;

function sortPlayers(
  players: PlayerType[],
  sortOrder: SortOrder,
  sortColumn: string = "number_disp",
): PlayerType[] {
  if (!sortOrder) return players;

  return [...players].sort((a, b) => {
    switch (sortColumn) {
      case "date_of_birth":
        return sortOrder === "asc"
          ? new Date(a.date_of_birth).getTime() -
              new Date(b.date_of_birth).getTime()
          : new Date(b.date_of_birth).getTime() -
              new Date(a.date_of_birth).getTime();
      case "height_cm":
        const aHeight = a.height_cm ?? 0;
        const bHeight = b.height_cm ?? 0;
        return sortOrder === "asc" ? aHeight - bHeight : bHeight - aHeight;
      case "weight_kg":
        const aWeight = a.weight_kg ?? 0;
        const bWeight = b.weight_kg ?? 0;
        return sortOrder === "asc" ? aWeight - bWeight : bWeight - aWeight;
      default:
        const aNum = parseInt(a.number_disp);
        const bNum = parseInt(b.number_disp);
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    }
  });
}

type Props = {
  players: PlayerType[];
  year: number;
  cheerSongNumbers?: Set<string>;
};

export default function PlayerTable({
  players,
  year,
  cheerSongNumbers,
}: Props) {
  const { furigana } = useFurigana();
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [sortColumn, setSortColumn] = useState<string>("number_disp");
  const sortedPlayers = sortPlayers(players, sortOrder, sortColumn);

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return FaSort;
    if (sortOrder === "asc") return FaSortUp;
    if (sortOrder === "desc") return FaSortDown;
    return FaSort;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const getAriaSort = (column: string): "ascending" | "descending" | "none" => {
    if (sortColumn !== column || !sortOrder) return "none";
    return sortOrder === "asc" ? "ascending" : "descending";
  };

  return (
    <div
      className="border rounded-md overflow-auto h-[600px] md:h-[900px]"
      style={{ borderColor: "var(--border-card)" }}
    >
      <table className="w-full text-sm border-collapse min-w-[640px]">
        <thead
          className="sticky top-0 z-10"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <tr className="border-b border-[var(--border-card)]">
            <th
              className="text-left px-3 py-2 whitespace-nowrap w-16"
              aria-sort={getAriaSort("number_disp")}
            >
              <div className="flex items-center gap-1">
                <span>
                  <Ruby reading="せばんごう">背番号</Ruby>
                </span>
                <button
                  aria-label="背番号でソート"
                  onClick={() => handleSort("number_disp")}
                  className="p-1 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer"
                >
                  {(() => {
                    const Icon = getSortIcon("number_disp");
                    return <Icon />;
                  })()}
                </button>
              </div>
            </th>
            <th className="text-left px-3 py-2 whitespace-nowrap">
              <Ruby reading="なまえ">名前</Ruby>
            </th>
            <th
              className="text-left px-3 py-2 whitespace-nowrap w-28"
              aria-sort={getAriaSort("date_of_birth")}
            >
              <div className="flex items-center gap-1">
                <span>
                  <Ruby reading="せいねんがっぴ">生年月日</Ruby>
                </span>
                <button
                  aria-label="生年月日でソート"
                  onClick={() => handleSort("date_of_birth")}
                  className="p-1 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer"
                >
                  {(() => {
                    const Icon = getSortIcon("date_of_birth");
                    return <Icon />;
                  })()}
                </button>
              </div>
            </th>
            <th
              className="text-left px-3 py-2 whitespace-nowrap w-20"
              aria-sort={getAriaSort("height_cm")}
            >
              <div className="flex items-center gap-1">
                <span>
                  <Ruby reading="しんちょう">身長</Ruby>
                </span>
                <button
                  aria-label="身長でソート"
                  onClick={() => handleSort("height_cm")}
                  className="p-1 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer"
                >
                  {(() => {
                    const Icon = getSortIcon("height_cm");
                    return <Icon />;
                  })()}
                </button>
              </div>
            </th>
            <th
              className="text-left px-3 py-2 whitespace-nowrap w-20"
              aria-sort={getAriaSort("weight_kg")}
            >
              <div className="flex items-center gap-1">
                <span>
                  <Ruby reading="たいじゅう">体重</Ruby>
                </span>
                <button
                  aria-label="体重でソート"
                  onClick={() => handleSort("weight_kg")}
                  className="p-1 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer"
                >
                  {(() => {
                    const Icon = getSortIcon("weight_kg");
                    return <Icon />;
                  })()}
                </button>
              </div>
            </th>
            <th className="text-left px-3 py-2 whitespace-nowrap w-16">
              リンク
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr
              key={player.number_disp}
              className="border-b border-[var(--border-card)]"
              style={{
                backgroundColor:
                  index % 2 === 0
                    ? "var(--surface-card-subtle)"
                    : "var(--surface-card)",
              }}
            >
              <td className="px-3 py-2 font-medium">{player.number_disp}</td>
              <td className="px-3 py-2">
                <a
                  href={player.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <span className="hover:text-[var(--interactive-primary)] transition-colors">
                    {furigana ? (
                      <Ruby reading={player.name_kana}>{player.name}</Ruby>
                    ) : (
                      <>
                        {player.name} ({player.name_kana})
                      </>
                    )}
                  </span>
                </a>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {player.date_of_birth}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {player.height_cm ? `${player.height_cm}cm` : "-"}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {player.weight_kg ? `${player.weight_kg}kg` : "-"}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/uniform-view/${year}?number=${player.number_disp}`}
                    title="ユニフォームを見る"
                  >
                    <button
                      aria-label={`${player.name}のユニフォームを見る`}
                      className="p-1 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer"
                      style={{ color: "var(--interactive-primary)" }}
                    >
                      <GiClothes />
                    </button>
                  </Link>
                  {cheerSongNumbers?.has(player.number_disp) && (
                    <Link
                      href={`/cheer-songs/${year}?number=${player.number_disp}`}
                      title="応援歌を見る"
                    >
                      <button
                        aria-label={`応援歌を見る`}
                        className="p-1 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer"
                        style={{ color: "var(--interactive-primary)" }}
                      >
                        <FiMusic />
                      </button>
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
