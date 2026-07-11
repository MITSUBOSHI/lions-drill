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

type SortableHeaderProps = {
  column: string;
  label: string;
  reading: string;
  widthClass: string;
  sortColumn: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
};

function SortableHeader({
  column,
  label,
  reading,
  widthClass,
  sortColumn,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortColumn === column;
  const Icon = !isActive
    ? FaSort
    : sortOrder === "asc"
      ? FaSortUp
      : sortOrder === "desc"
        ? FaSortDown
        : FaSort;
  const ariaSort =
    !isActive || !sortOrder
      ? "none"
      : sortOrder === "asc"
        ? "ascending"
        : "descending";

  return (
    <th
      className={`text-left px-1 py-1 whitespace-nowrap ${widthClass}`}
      aria-sort={ariaSort}
    >
      <button
        aria-label={`${label}でソート`}
        onClick={() => onSort(column)}
        className="flex items-center gap-1 min-h-11 px-2 rounded hover:bg-[var(--surface-brand)] bg-transparent border-none cursor-pointer font-bold"
      >
        <Ruby reading={reading}>{label}</Ruby>
        <Icon aria-hidden="true" />
      </button>
    </th>
  );
}

export default function PlayerTable({
  players,
  year,
  cheerSongNumbers,
}: Props) {
  const { furigana } = useFurigana();
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [sortColumn, setSortColumn] = useState<string>("number_disp");
  const [searchTerm, setSearchTerm] = useState("");

  // 名前・ひらがな・背番号の部分一致で絞り込む
  const filteredPlayers = searchTerm
    ? players.filter(
        (player) =>
          player.name.includes(searchTerm) ||
          player.name_kana.includes(searchTerm) ||
          player.number_disp.includes(searchTerm),
      )
    : players;
  const sortedPlayers = sortPlayers(filteredPlayers, sortOrder, sortColumn);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="名前・ひらがな・背番号で検索..."
          aria-label="選手を検索"
          className="w-full max-w-xs border rounded-md px-3 py-2 text-sm"
          style={{
            borderColor: "var(--border-card)",
            backgroundColor: "var(--surface-card)",
          }}
        />
        <span
          className="text-sm whitespace-nowrap"
          style={{ color: "var(--text-secondary)" }}
        >
          {sortedPlayers.length}
          <Ruby reading="めい">名</Ruby>
        </span>
      </div>
      <div
        className="border rounded-md overflow-auto max-h-[600px] md:max-h-[900px]"
        style={{ borderColor: "var(--border-card)" }}
      >
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead
            className="sticky top-0 z-10"
            style={{ backgroundColor: "var(--surface-card)" }}
          >
            <tr className="border-b border-[var(--border-card)]">
              <SortableHeader
                column="number_disp"
                label="背番号"
                reading="せばんごう"
                widthClass="w-16"
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <th className="text-left px-3 py-2 whitespace-nowrap">
                <Ruby reading="なまえ">名前</Ruby>
              </th>
              <SortableHeader
                column="date_of_birth"
                label="生年月日"
                reading="せいねんがっぴ"
                widthClass="w-28"
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableHeader
                column="height_cm"
                label="身長"
                reading="しんちょう"
                widthClass="w-20"
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableHeader
                column="weight_kg"
                label="体重"
                reading="たいじゅう"
                widthClass="w-20"
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
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
                      aria-label={`${player.name}のユニフォームを見る`}
                      className="flex items-center justify-center min-w-11 min-h-11 rounded hover:bg-[var(--surface-brand)]"
                      style={{ color: "var(--interactive-primary)" }}
                    >
                      <GiClothes aria-hidden="true" size={18} />
                    </Link>
                    {cheerSongNumbers?.has(player.number_disp) && (
                      <Link
                        href={`/cheer-songs/${year}?number=${player.number_disp}`}
                        title="応援歌を見る"
                        aria-label={`${player.name}の応援歌を見る`}
                        className="flex items-center justify-center min-w-11 min-h-11 rounded hover:bg-[var(--surface-brand)]"
                        style={{ color: "var(--interactive-primary)" }}
                      >
                        <FiMusic aria-hidden="true" size={18} />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
