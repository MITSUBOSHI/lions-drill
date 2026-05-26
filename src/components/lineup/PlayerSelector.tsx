"use client";

import { PlayerType } from "@/types/Player";
import { Position } from "./LineupCreator";
import { useState, useRef, useEffect, useCallback } from "react";

type Props = {
  players: PlayerType[];
  onSelectPlayer: (player: PlayerType | null) => void;
  selectedPlayer: PlayerType | null;
  position: Position;
  getDisplayName: (player: PlayerType | null) => string;
};

export default function PlayerSelector({
  players,
  onSelectPlayer,
  selectedPlayer,
  position,
  getDisplayName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Toggle the dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Focus on search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter players based on search term
  const filteredPlayers = players.filter(
    (player) =>
      player.name.includes(searchTerm) ||
      player.name_kana.includes(searchTerm) ||
      String(player.number_disp).includes(searchTerm),
  );

  // 選手を選択する
  const handleSelectPlayer = useCallback(
    (player: PlayerType) => {
      onSelectPlayer(player);
      setIsOpen(false);
      setSearchTerm("");
    },
    [onSelectPlayer],
  );

  // 選手の選択を解除する
  const handleClearSelection = () => {
    onSelectPlayer(null);
  };

  // キーボードナビゲーション
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredPlayers.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredPlayers.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredPlayers.length
          ) {
            handleSelectPlayer(filteredPlayers[highlightedIndex]);
          }
          break;
      }
    },
    [isOpen, filteredPlayers, highlightedIndex, handleSelectPlayer],
  );

  // ハイライト中の項目をスクロールに追従
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div className="relative" ref={containerRef}>
      {/* 選択済みの場合は選手情報を表示 */}
      {selectedPlayer ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-base px-2 py-0.5 rounded mr-2 bg-blue-100 text-blue-800 font-semibold">
              {selectedPlayer.number_disp}
            </span>
            <span>{getDisplayName(selectedPlayer)}</span>
          </div>
          <button
            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded border border-red-300"
            onClick={handleClearSelection}
          >
            クリア
          </button>
        </div>
      ) : (
        // 未選択の場合はドロップダウンボタンを表示
        <button
          className="w-full flex items-center justify-between px-4 py-2 border rounded-md bg-[var(--surface-card-subtle)] cursor-pointer"
          style={{
            borderColor: "var(--border-card)",
            color: "var(--text-primary)",
          }}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`${position}の選手を選択`}
        >
          <span>{position}の選手を選択</span>
          <span
            className="transition-transform duration-200"
            style={{
              transform: isOpen ? "rotate(180deg)" : "none",
            }}
          >
            ▼
          </span>
        </button>
      )}

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className="absolute w-full max-h-[300px] overflow-y-auto mt-2 border rounded-md shadow-md z-10"
          style={{
            backgroundColor: "var(--surface-card-subtle)",
            borderColor: "var(--border-card)",
          }}
        >
          <div className="p-2">
            <input
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full mb-2 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
              style={{
                borderColor: "var(--border-card)",
                backgroundColor: "var(--surface-card-subtle)",
                color: "var(--text-primary)",
              }}
              ref={searchInputRef}
              aria-label="選手を検索"
            />

            <div role="listbox" ref={listRef} aria-label={`${position}の選手`}>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player, index) => (
                  <div
                    key={`${player.year}-${player.number_disp}`}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className="p-2 cursor-pointer rounded"
                    style={{
                      backgroundColor:
                        index === highlightedIndex
                          ? "var(--surface-brand)"
                          : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--surface-brand)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index === highlightedIndex
                          ? "var(--surface-brand)"
                          : "transparent")
                    }
                    onClick={() => handleSelectPlayer(player)}
                  >
                    <div className="flex items-center">
                      <span className="text-sm px-2 py-0.5 rounded mr-2 bg-blue-100 text-blue-800 font-semibold">
                        {player.number_disp}
                      </span>
                      <span>{getDisplayName(player)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-2" style={{ color: "var(--text-secondary)" }}>
                  選手が見つかりません
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
