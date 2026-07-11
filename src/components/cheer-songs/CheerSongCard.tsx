"use client";

import { useState } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { GiClothes } from "react-icons/gi";
import { FiBook } from "react-icons/fi";
import { CheerSongType, YouTubeUrl } from "@/types/CheerSong";
import { replaceNamePlaceholder } from "@/lib/rubyParser";
import Ruby from "@/components/common/Ruby";
import LyricLine from "./LyricLine";

function extractYouTubeVideoId(url: YouTubeUrl): string | null {
  const longMatch = url.match(/[?&]v=([^&]+)/);
  if (longMatch) return longMatch[1];
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch) return shortsMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

type CheerSongCardProps = {
  song: CheerSongType;
  showRuby: boolean;
  selectedPlayerName?: string;
  defaultOpen?: boolean;
  id?: string;
  year?: number;
};

const categoryLabel: Record<string, { text: string; kana: string }> = {
  right_pitcher: { text: "右投手共通", kana: "みぎとうしゅきょうつう" },
  left_pitcher: { text: "左投手共通", kana: "ひだりとうしゅきょうつう" },
  foreign_pitcher: {
    text: "外国人投手共通",
    kana: "がいこくじんとうしゅきょうつう",
  },
  individual_pitcher: { text: "投手個人", kana: "とうしゅこじん" },
  individual_batter: { text: "野手個人", kana: "やしゅこじん" },
  pinch_hitter: { text: "代打", kana: "だいだ" },
  catcher: { text: "捕手", kana: "ほしゅ" },
  right_batter: { text: "右打者共通", kana: "みぎだしゃきょうつう" },
  left_batter: { text: "左打者共通", kana: "ひだりだしゃきょうつう" },
  manager: { text: "監督", kana: "かんとく" },
  multi: { text: "マルチテーマ", kana: "まるちてーま" },
  other: { text: "その他", kana: "そのた" },
  anthem: { text: "球団歌", kana: "きゅうだんか" },
  chance: { text: "チャンステーマ", kana: "ちゃんすてーま" },
};

export default function CheerSongCard({
  song,
  showRuby,
  selectedPlayerName,
  defaultOpen = false,
  id,
  year,
}: CheerSongCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedName, setSelectedName] = useState(selectedPlayerName);

  const displayName =
    selectedName && song.namePlaceholder ? selectedName : undefined;

  const lyricsToDisplay = song.lyrics.map((line) =>
    displayName ? replaceNamePlaceholder(line, displayName) : line,
  );

  return (
    <div
      id={id}
      className="w-full border border-[var(--border-card)] rounded-lg bg-[var(--surface-card)] overflow-hidden"
    >
      <div
        className="p-4 cursor-pointer hover:bg-[var(--surface-card-subtle)] transition-colors duration-200"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
            sendGAEvent("event", "cheer_song_open", {
              song_title: song.title,
              category: song.category,
              player_number: song.playerNumber ?? "",
            });
          }
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1 items-start">
            <h3 className="text-lg font-bold">
              {song.playerNumber && (
                <span className="text-[var(--interactive-primary)] mr-2">
                  #{song.playerNumber}
                </span>
              )}
              {showRuby && song.playerNameKana ? (
                <>
                  {song.title.split(/\s+/).map((part, i, arr) => {
                    const kanaWords = song.playerNameKana!.split(/\s+/);
                    return (
                      <span key={i}>
                        <ruby>
                          {part}
                          <rt>{kanaWords[i] || ""}</rt>
                        </ruby>
                        {i < arr.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </>
              ) : (
                song.title
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {showRuby && categoryLabel[song.category] ? (
                <ruby>
                  {categoryLabel[song.category].text}
                  <rt>{categoryLabel[song.category].kana}</rt>
                </ruby>
              ) : (
                categoryLabel[song.category]?.text || song.category
              )}
            </span>
            <span
              className={`text-xl text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </div>
        </div>
        {song.isCommon && song.applicablePlayers && !isOpen && (
          <div className="flex mt-2 gap-1 flex-wrap">
            {song.applicablePlayers.map((p) => (
              <span
                key={p.number}
                className="inline-flex items-center px-1.5 py-0.5 rounded border text-xs"
              >
                {p.callName}
              </span>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="px-4 pb-4">
          {song.isCommon && song.applicablePlayers && (
            <div className="flex mb-3 gap-2 flex-wrap">
              {song.applicablePlayers.map((p) => (
                <span
                  key={p.number}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs cursor-pointer ${
                    selectedName === p.callName
                      ? "bg-blue-600 text-white"
                      : "border"
                  }`}
                  onClick={() => setSelectedName(p.callName)}
                >
                  #{p.number} {p.callName}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col">
            {lyricsToDisplay.map((line, i) => (
              <LyricLine key={i} line={line} showRuby={showRuby} />
            ))}
          </div>
          {song.audioUrl && (
            <audio
              controls
              preload="none"
              src={song.audioUrl}
              className="mt-3 w-full"
              onPlay={() =>
                sendGAEvent("event", "cheer_song_audio_play", {
                  song_title: song.title,
                  player_number: song.playerNumber ?? "",
                })
              }
            >
              お使いのブラウザは音声再生に対応していません
            </audio>
          )}
          {song.sourceUrl && (
            <p className="mt-3 text-xs text-[var(--text-secondary)]">
              <Ruby reading="しゅってん">出典</Ruby>:{" "}
              <a
                href={song.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center min-h-11"
              >
                <span>
                  <Ruby reading="おうえんだん">応援団</Ruby>サイトで
                  <Ruby reading="しょうさい">詳細</Ruby>を
                  <Ruby reading="み">見</Ruby>る
                </span>
              </a>
            </p>
          )}
          {year && song.playerNumber && (
            <div className="flex mt-3 gap-1">
              <Link
                href={`/uniform-view/${year}?number=${song.playerNumber}`}
                title="ユニフォームを見る"
                aria-label={`${song.title}のユニフォームを見る`}
                className="flex items-center justify-center min-w-11 min-h-11 text-[var(--interactive-primary)] hover:bg-[var(--surface-card-subtle)] rounded"
              >
                <GiClothes size={20} aria-hidden="true" />
              </Link>
              <Link
                href={`/player-directory/${year}`}
                title="選手名鑑を見る"
                aria-label="選手名鑑を見る"
                className="flex items-center justify-center min-w-11 min-h-11 text-[var(--interactive-primary)] hover:bg-[var(--surface-card-subtle)] rounded"
              >
                <FiBook size={20} aria-hidden="true" />
              </Link>
            </div>
          )}
          {song.url &&
            (() => {
              const videoId = extractYouTubeVideoId(song.url);
              if (!videoId) return null;
              return (
                <>
                  <button
                    className="mt-3 inline-flex items-center gap-1 min-h-11 text-[var(--interactive-primary)] text-sm cursor-pointer hover:underline bg-transparent border-none"
                    onClick={() => {
                      const next = !showVideo;
                      setShowVideo(next);
                      if (next) {
                        sendGAEvent("event", "cheer_song_video_play", {
                          song_title: song.title,
                          player_number: song.playerNumber ?? "",
                        });
                      }
                    }}
                  >
                    {showVideo ? (
                      <>
                        ▲ <Ruby reading="どうが">動画</Ruby>を
                        <Ruby reading="と">閉</Ruby>じる
                      </>
                    ) : (
                      <>
                        ▶ <Ruby reading="どうが">動画</Ruby>を
                        <Ruby reading="み">見</Ruby>る
                      </>
                    )}
                  </button>
                  {showVideo && (
                    <div className="mt-2 relative w-full pt-[56.25%]">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`${song.title} 応援歌`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}
                </>
              );
            })()}
        </div>
      )}
    </div>
  );
}
