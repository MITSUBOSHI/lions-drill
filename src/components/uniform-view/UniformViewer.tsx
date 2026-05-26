"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type TouchEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { PlayerType, Role } from "@/types/Player";
import {
  FiChevronLeft,
  FiChevronRight,
  FiLink,
  FiCheck,
  FiMusic,
  FiExternalLink,
} from "react-icons/fi";
import { Switch } from "@/components/ui/switch";
import { useFurigana } from "@/contexts/FuriganaContext";
import Ruby from "@/components/common/Ruby";
import UniformBack from "./UniformBack";

type Props = {
  players: PlayerType[];
  year: number;
  cheerSongNumbers?: Set<string>;
};

export default function UniformViewer({
  players,
  year,
  cheerSongNumbers,
}: Props) {
  const { furigana } = useFurigana();
  const searchParams = useSearchParams();
  const [rosterOnly, setRosterOnly] = useState(false);
  const [numberSelectValue, setNumberSelectValue] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredPlayers = useMemo(
    () =>
      players
        .filter((p) => !rosterOnly || p.role === Role.Roster)
        .sort((a, b) => a.number_calc - b.number_calc),
    [players, rosterOnly],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [rosterOnly]);

  const numberParam = searchParams.get("number");
  const appliedNumberParam = useRef<string | null>(null);
  useEffect(() => {
    if (!numberParam || numberParam === appliedNumberParam.current) return;
    appliedNumberParam.current = numberParam;
    if (filteredPlayers.length > 0) {
      const index = filteredPlayers.findIndex(
        (p) => p.number_disp === numberParam,
      );
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [numberParam, filteredPlayers]);

  const currentPlayer = filteredPlayers[currentIndex];

  useEffect(() => {
    if (currentPlayer) {
      setNumberSelectValue(currentPlayer.number_disp);
    }
  }, [currentPlayer]);

  const handleNumberSelect = useCallback(
    (value: string) => {
      setNumberSelectValue(value);
      const index = filteredPlayers.findIndex((p) => p.number_disp === value);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    },
    [filteredPlayers],
  );

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : filteredPlayers.length - 1,
    );
  }, [filteredPlayers.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < filteredPlayers.length - 1 ? prev + 1 : 0,
    );
  }, [filteredPlayers.length]);

  const handlePrev = useCallback(() => {
    sendGAEvent("event", "uniform_swipe", {
      direction: "prev",
      player_number: currentPlayer?.number_disp,
    });
    goToPrev();
  }, [goToPrev, currentPlayer]);

  const handleNext = useCallback(() => {
    sendGAEvent("event", "uniform_swipe", {
      direction: "next",
      player_number: currentPlayer?.number_disp,
    });
    goToNext();
  }, [goToNext, currentPlayer]);

  const handleCopyLink = useCallback(async () => {
    if (!currentPlayer) return;
    const url = `${window.location.origin}${window.location.pathname}?number=${currentPlayer.number_disp}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      sendGAEvent("event", "uniform_copy_link", {
        player_number: currentPlayer.number_disp,
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.warn("Clipboard API not available");
    }
  }, [currentPlayer]);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      const SWIPE_THRESHOLD = 50;
      if (diff > SWIPE_THRESHOLD) {
        handlePrev();
      } else if (diff < -SWIPE_THRESHOLD) {
        handleNext();
      }
      touchStartX.current = null;
    },
    [handlePrev, handleNext],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  if (filteredPlayers.length === 0) {
    return (
      <p style={{ color: "var(--text-secondary)" }}>選手データがありません</p>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto select-none">
      <div className="flex justify-center items-center gap-4 mb-4">
        <Switch
          checked={rosterOnly}
          onCheckedChange={(e) => setRosterOnly(e.checked)}
          size="sm"
        >
          支配下のみ
        </Switch>
      </div>

      <div className="text-center mb-4">
        <p
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {furigana ? (
            <Ruby reading={currentPlayer.name_kana}>{currentPlayer.name}</Ruby>
          ) : (
            currentPlayer.name
          )}
        </p>
        <div className="flex justify-center items-center gap-2">
          <div className="flex items-center gap-1">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              No.
            </span>
            <input
              list="player-numbers"
              value={numberSelectValue}
              onChange={(e) => handleNumberSelect(e.target.value)}
              onFocus={() => setNumberSelectValue("")}
              onClick={() => setNumberSelectValue("")}
              onBlur={() => setNumberSelectValue(currentPlayer.number_disp)}
              aria-label="背番号を選択"
              className="w-12 text-sm px-1 py-0.5 border rounded text-center"
              style={{
                borderColor: "var(--border-card)",
                backgroundColor: "var(--surface-card-subtle)",
                color: "var(--text-primary)",
              }}
            />
            <datalist id="player-numbers">
              {filteredPlayers.map((p) => (
                <option key={p.number_disp} value={p.number_disp} />
              ))}
            </datalist>
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              / {currentPlayer.name_kana}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            aria-label="URLをコピー"
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {copied ? (
              <FiCheck size={16} color="#28a745" />
            ) : (
              <FiLink size={16} color="#004B98" style={{ opacity: 0.6 }} />
            )}
          </button>
          {cheerSongNumbers?.has(currentPlayer.number_disp) && (
            <Link
              href={`/cheer-songs/${year}?number=${currentPlayer.number_disp}`}
              title="応援歌を見る"
            >
              <button
                aria-label={`${currentPlayer.name}の応援歌を見る`}
                className="p-1 rounded hover:bg-gray-100"
                style={{ color: "var(--interactive-primary)" }}
              >
                <FiMusic />
              </button>
            </Link>
          )}
          {currentPlayer.url && (
            <a
              href={currentPlayer.url}
              target="_blank"
              rel="noopener noreferrer"
              title="NPB選手ページ"
            >
              <button
                aria-label={`${currentPlayer.name}のNPBページを開く`}
                className="p-1 rounded hover:bg-gray-100"
                style={{ color: "var(--interactive-primary)" }}
              >
                <FiExternalLink />
              </button>
            </a>
          )}
        </div>
      </div>

      {/* ユニフォーム + 左右タップ領域 */}
      <div
        className="relative cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <UniformBack
          uniformName={currentPlayer.uniform_name}
          numberDisp={currentPlayer.number_disp}
        />

        {/* 左半分タップ領域 */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-start pl-2 rounded-md group"
          onClick={handlePrev}
          aria-label="前の選手"
          role="button"
        >
          <div className="bg-black/10 rounded-full p-1 opacity-70 transition-all duration-200 flex items-center justify-center group-hover:opacity-100 group-hover:bg-black/20">
            <FiChevronLeft size={32} color="#004B98" />
          </div>
        </div>

        {/* 右半分タップ領域 */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-end pr-2 rounded-md group"
          onClick={handleNext}
          aria-label="次の選手"
          role="button"
        >
          <div className="bg-black/10 rounded-full p-1 opacity-70 transition-all duration-200 flex items-center justify-center group-hover:opacity-100 group-hover:bg-black/20">
            <FiChevronRight size={32} color="#004B98" />
          </div>
        </div>
      </div>

      <p
        className="text-center mt-4 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {currentIndex + 1} / {filteredPlayers.length}
      </p>
    </div>
  );
}
