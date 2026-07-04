"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { FiPlay, FiPause, FiRotateCcw } from "react-icons/fi";
import { sendGAEvent } from "@next/third-parties/google";
import { PlayerType, Role } from "@/types/Player";
import { extractFamilyNameKana } from "@/lib/nameUtils";
import UniformBack from "@/components/uniform-view/UniformBack";
import { useFurigana } from "@/contexts/FuriganaContext";
import Ruby from "@/components/common/Ruby";
import { TEAM } from "@/config/team";
import CounterSettings from "./CounterSettings";

type Props = {
  players: PlayerType[];
};

type CountState = "idle" | "counting" | "paused" | "finished";
export type CountDirection = "up" | "down";

type Step = {
  displayNumber: string;
  player: PlayerType | null;
};

export default function NumberCounter({ players }: Props) {
  const { furigana } = useFurigana();
  const [state, setState] = useState<CountState>("idle");
  const [direction, setDirection] = useState<CountDirection>("up");
  const [intervalMs, setIntervalMs] = useState(1000);
  const [countLimit, setCountLimit] = useState(30);
  const [countLimitInput, setCountLimitInput] = useState("30");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [includeZero, setIncludeZero] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // number_disp → 選手のマップを構築（支配下選手・育成選手）
  const playerByDisp = useMemo(() => {
    const map = new Map<string, PlayerType>();
    for (const player of players.filter(
      (p) => p.role === Role.Roster || p.role === Role.Training,
    )) {
      map.set(player.number_disp, player);
    }
    return map;
  }, [players]);

  // カウントするステップのリストを構築
  const steps = useMemo(() => {
    const result: Step[] = [];

    if (includeZero) {
      result.push({
        displayNumber: "00",
        player: playerByDisp.get("00") ?? null,
      });
      result.push({
        displayNumber: "0",
        player: playerByDisp.get("0") ?? null,
      });
    }

    for (let i = 1; i <= countLimit; i++) {
      const disp = String(i);
      result.push({
        displayNumber: disp,
        player: playerByDisp.get(disp) ?? null,
      });
    }

    if (direction === "down") {
      result.reverse();
    }

    return result;
  }, [playerByDisp, includeZero, countLimit, direction]);

  // 初期値設定
  useEffect(() => {
    setCurrentIndex(0);
    setState("idle");
    stopInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const currentStep = steps[currentIndex] ?? null;
  const currentPlayer = currentStep?.player ?? null;

  // 日本語音声の取得・キャッシュ
  const jaVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const pickJaVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // ja-JP を優先、なければ ja で始まる音声を使う
      jaVoiceRef.current =
        voices.find((v) => v.lang === "ja-JP") ??
        voices.find((v) => v.lang.startsWith("ja")) ??
        null;
    };

    pickJaVoice();
    // Chrome/Android: 音声リストは非同期ロードされる
    window.speechSynthesis.addEventListener("voiceschanged", pickJaVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickJaVoice);
    };
  }, []);

  // 音声読み上げ
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const needsCancel = synth.speaking || synth.pending;

    // 予約済みの発話タイマーをクリア
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    if (jaVoiceRef.current) {
      utterance.voice = jaVoiceRef.current;
    }
    // GC による発話中断を防ぐため参照を保持
    utteranceRef.current = utterance;

    if (needsCancel) {
      // Chrome: cancel() は内部的に非同期。直後の speak() は破棄されるため、
      // cancel 完了を待ってから speak する。
      synth.cancel();
      speakTimeoutRef.current = setTimeout(() => {
        synth.speak(utterance);
        speakTimeoutRef.current = null;
      }, 100);
    } else {
      // 再生中でなければ cancel 不要。同期的に speak することで
      // ユーザージェスチャのコンテキストを維持する（Chrome の自動再生ポリシー対策）。
      synth.speak(utterance);
    }
  }, []);

  const speakStep = useCallback(
    (index: number) => {
      const step = steps[index];
      if (step?.player) {
        speak(extractFamilyNameKana(step.player.name_kana));
      } else {
        speak(TEAM.uniform.fallbackPlayerKana);
      }
    },
    [steps, speak],
  );

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const isAtEnd = useCallback(
    (index: number) => index >= steps.length,
    [steps.length],
  );

  // カウント1ステップ進める
  const tick = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (isAtEnd(next)) {
          stopInterval();
          setState("finished");
          return prev;
        }
        // 副作用（音声）は次のレンダーで useEffect から実行
        return next;
      });
      setFadeIn(true);
    }, 150);
  }, [isAtEnd, stopInterval]);

  // 再生開始
  const start = useCallback(() => {
    // iOS Safari 対策: ユーザーアクション内で初回speak
    if (speechEnabled) {
      speakStep(currentIndex);
    }
    sendGAEvent("event", "number_count_start", {
      direction,
      count_limit: countLimit,
    });
    setState("counting");
    intervalRef.current = setInterval(tick, intervalMs);
  }, [
    countLimit,
    currentIndex,
    direction,
    intervalMs,
    speechEnabled,
    speakStep,
    tick,
  ]);

  // 再開
  const resume = useCallback(() => {
    setState("counting");
    intervalRef.current = setInterval(tick, intervalMs);
  }, [intervalMs, tick]);

  // 一時停止
  const pause = useCallback(() => {
    stopInterval();
    setState("paused");
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [stopInterval]);

  // リセット
  const reset = useCallback(() => {
    stopInterval();
    setState("idle");
    setCurrentIndex(0);
    setFadeIn(true);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [stopInterval]);

  // カウント中にステップが変わったら音声を発声
  const prevIndexRef = useRef(currentIndex);
  useEffect(() => {
    if (
      speechEnabled &&
      state === "counting" &&
      currentIndex !== prevIndexRef.current
    ) {
      speakStep(currentIndex);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex, state, speechEnabled, speakStep]);

  // Chrome: speechSynthesis が長時間連続使用時に自動停止するバグへの対策
  useEffect(() => {
    if (state !== "counting" || !speechEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const id = setInterval(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);
    return () => clearInterval(id);
  }, [state, speechEnabled]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopInterval();
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopInterval]);

  // intervalMs 変更時にカウント中なら再設定
  useEffect(() => {
    if (state === "counting") {
      stopInterval();
      intervalRef.current = setInterval(tick, intervalMs);
    }
  }, [intervalMs, state, stopInterval, tick]);

  // 表示情報
  const uniformName = currentPlayer?.uniform_name ?? TEAM.uniform.fallbackName;
  const numberDisp = currentStep?.displayNumber ?? "1";
  const displayName = currentPlayer?.name ?? TEAM.uniform.fallbackPlayerName;
  const displayKana = currentPlayer
    ? currentPlayer.name_kana
    : TEAM.uniform.fallbackPlayerKana;
  const lastStep = steps[steps.length - 1];

  const handleCountLimitSelect = useCallback((value: string) => {
    setCountLimitInput(value);
    const v = parseInt(value, 10);
    if (!isNaN(v) && v >= 1 && v <= 200) {
      setCountLimit(v);
    }
  }, []);

  return (
    <div className="w-full max-w-[400px] mx-auto select-none">
      {/* 設定 */}
      <div className="mb-6">
        <CounterSettings
          direction={direction}
          onDirectionChange={setDirection}
          intervalMs={intervalMs}
          onIntervalMsChange={setIntervalMs}
          countLimitInput={countLimitInput}
          onCountLimitSelect={handleCountLimitSelect}
          onCountLimitFocus={() => setCountLimitInput("")}
          onCountLimitBlur={() => setCountLimitInput(String(countLimit))}
          speechEnabled={speechEnabled}
          onSpeechEnabledChange={setSpeechEnabled}
          includeZero={includeZero}
          onIncludeZeroChange={setIncludeZero}
          disabled={state === "counting"}
        />
      </div>

      {/* ユニフォーム表示 */}
      <div
        style={{
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 0.15s ease-in-out",
        }}
      >
        <UniformBack
          uniformName={uniformName}
          numberDisp={numberDisp}
          clipPathId="countUniformClip"
        />
      </div>

      {/* 選手情報 */}
      <div className="text-center mb-4">
        <p
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {furigana ? (
            <Ruby reading={displayKana}>{displayName}</Ruby>
          ) : (
            displayName
          )}
        </p>
        {!furigana && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {displayKana}
          </p>
        )}
      </div>

      {/* 進捗 */}
      <p
        className="text-center mb-4 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {currentStep?.displayNumber} / {lastStep?.displayNumber}
      </p>

      {/* 操作ボタン */}
      <div className="flex justify-center items-center gap-4 mb-6">
        {/* リセット */}
        <button
          onClick={reset}
          className="flex items-center justify-center min-w-11 min-h-11 rounded-full border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: "var(--border-card)" }}
          aria-label="リセット"
          disabled={state === "idle"}
        >
          <FiRotateCcw size={20} />
        </button>

        {/* 再生/停止 */}
        {state === "counting" ? (
          <button
            onClick={pause}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: "var(--interactive-primary)" }}
            aria-label="停止"
          >
            <FiPause size={24} />
          </button>
        ) : (
          <button
            onClick={state === "paused" ? resume : start}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--interactive-primary)" }}
            aria-label="再生"
            disabled={state === "finished"}
          >
            <FiPlay size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
