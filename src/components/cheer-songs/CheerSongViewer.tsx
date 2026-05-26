"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { CheerSongType } from "@/types/CheerSong";
import { useFurigana } from "@/contexts/FuriganaContext";
import CheerSongCard from "./CheerSongCard";

type CategoryTab =
  | "pitcher"
  | "individual"
  | "other"
  | "manager"
  | "chance"
  | "anthem";

const tabs: { key: CategoryTab; label: string }[] = [
  { key: "pitcher", label: "投手共通" },
  { key: "individual", label: "野手個人" },
  { key: "other", label: "その他共通" },
  { key: "manager", label: "監督" },
  { key: "chance", label: "チャンステーマ" },
  { key: "anthem", label: "球団歌" },
];

const categoryToTab: Record<string, CategoryTab> = {
  right_pitcher: "pitcher",
  left_pitcher: "pitcher",
  foreign_pitcher: "pitcher",
  individual_batter: "individual",
  pinch_hitter: "other",
  catcher: "other",
  right_batter: "other",
  left_batter: "other",
  manager: "manager",
  chance: "chance",
  anthem: "anthem",
};

function filterByTab(songs: CheerSongType[], tab: CategoryTab) {
  switch (tab) {
    case "pitcher":
      return songs.filter((s) =>
        ["right_pitcher", "left_pitcher", "foreign_pitcher"].includes(
          s.category,
        ),
      );
    case "individual":
      return songs.filter((s) => s.category === "individual_batter");
    case "other":
      return songs.filter((s) =>
        ["pinch_hitter", "catcher", "right_batter", "left_batter"].includes(
          s.category,
        ),
      );
    case "manager":
      return songs.filter((s) => s.category === "manager");
    case "chance":
      return songs.filter((s) => s.category === "chance");
    case "anthem":
      return songs.filter((s) => s.category === "anthem");
  }
}

type CheerSongViewerProps = {
  songs: CheerSongType[];
  year: number;
};

export default function CheerSongViewer({ songs, year }: CheerSongViewerProps) {
  const { furigana: showRuby } = useFurigana();
  const searchParams = useSearchParams();
  const numberParam = searchParams.get("number");

  // number パラメータに該当する曲を検索
  const targetSong = numberParam
    ? songs.find(
        (s) =>
          s.playerNumber === numberParam ||
          s.applicablePlayers?.some((p) => p.number === numberParam),
      )
    : null;

  const initialTab = targetSong
    ? (categoryToTab[targetSong.category] ?? "pitcher")
    : "pitcher";

  const [activeTab, setActiveTab] = useState<CategoryTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // number パラメータの曲にスクロール
  useEffect(() => {
    if (!targetSong) return;
    const elementId = `song-${targetSong.id}`;
    // レンダリング後にスクロール
    const timer = setTimeout(() => {
      const el = document.getElementById(elementId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(timer);
  }, [targetSong]);

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.trim().toLowerCase();

  const filteredSongs = useMemo(() => {
    const sortByNumber = (list: CheerSongType[]) =>
      [...list].sort(
        (a, b) =>
          (a.playerNumber != null ? parseInt(a.playerNumber) : 9999) -
          (b.playerNumber != null ? parseInt(b.playerNumber) : 9999),
      );
    if (isSearching) {
      return sortByNumber(
        songs.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.playerNumber?.includes(query) ||
            s.playerNameKana?.includes(query) ||
            s.applicablePlayers?.some(
              (p) =>
                p.callName.toLowerCase().includes(query) ||
                p.name.toLowerCase().includes(query),
            ),
        ),
      );
    }
    return sortByNumber(filterByTab(songs, activeTab));
  }, [songs, activeTab, isSearching, query]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="sticky top-0 z-5 w-full py-3 border-b"
        style={{
          backgroundColor: "var(--surface-card)",
          borderColor: "var(--border-card)",
        }}
      >
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center w-full px-2 gap-2">
            <div
              className="shrink-0"
              style={{ color: "var(--text-secondary)" }}
            >
              <FiSearch />
            </div>
            <input
              placeholder="選手名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="応援歌を検索"
              className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
              style={{
                backgroundColor: "var(--surface-card-subtle)",
                borderColor: "var(--border-card)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div
            className="w-full overflow-x-auto"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            <div
              className="flex items-center gap-2 min-w-max"
              role="tablist"
              aria-label="応援歌カテゴリ"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  id={`tab-${tab.key}`}
                  aria-selected={activeTab === tab.key}
                  aria-controls={`tabpanel-${tab.key}`}
                  className={`px-4 py-3 rounded-md border whitespace-nowrap cursor-pointer transition-all duration-200 hover:border-[var(--interactive-primary)] ${
                    activeTab === tab.key
                      ? "font-bold text-white"
                      : "font-normal"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === tab.key
                        ? "var(--interactive-primary)"
                        : "transparent",
                    color:
                      activeTab === tab.key ? "white" : "var(--text-secondary)",
                    borderColor:
                      activeTab === tab.key
                        ? "var(--border-brand)"
                        : "var(--border-card)",
                  }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col gap-4 w-full"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {filteredSongs.map((song) => (
          <CheerSongCard
            key={song.id}
            id={`song-${song.id}`}
            song={song}
            showRuby={showRuby}
            defaultOpen={targetSong?.id === song.id}
            year={year}
          />
        ))}
      </div>
    </div>
  );
}
