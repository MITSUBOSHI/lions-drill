"use client";

import { PlayerType, Role } from "@/types/Player";
import {
  type NameDisplayMode,
  type Position,
  NAME_DISPLAY_OPTIONS,
  POSITION_READINGS,
} from "@/types/common";
import Ruby from "@/components/common/Ruby";
export type { Position } from "@/types/common";
import { sendGAEvent } from "@next/third-parties/google";
import { getDisplayName as getDisplayNameBase } from "@/lib/nameUtils";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiDownload,
  FiLink,
  FiCheck,
  FiShare2,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import OptionGroup from "@/components/common/OptionGroup";
import { Switch } from "@/components/ui/switch";
import { encodeLineupParams, decodeLineupParams } from "@/lib/lineupUrl";
import { TEAM } from "@/config/team";
import LineupTable from "./LineupTable";
import PlayerSelector from "./PlayerSelector";
import dynamic from "next/dynamic";
import { type DropResult } from "@hello-pangea/dnd";

// バッティングオーダーとポジションのタイプ
export type LineupSpot = {
  order: number | null;
  player: PlayerType | null;
  position: Position;
};

// デフォルトの各ポジション情報（打順はnullで初期化）
const DEFAULT_LINEUP: LineupSpot[] = [
  { order: null, player: null, position: "投手" },
  { order: null, player: null, position: "捕手" },
  { order: null, player: null, position: "一塁手" },
  { order: null, player: null, position: "二塁手" },
  { order: null, player: null, position: "三塁手" },
  { order: null, player: null, position: "遊撃手" },
  { order: null, player: null, position: "左翼手" },
  { order: null, player: null, position: "中堅手" },
  { order: null, player: null, position: "右翼手" },
];

// 動的インポートでSSRを無効化
const DraggableLineup = dynamic(() => import("./DraggableLineup"), {
  ssr: false,
});

type Props = {
  players: PlayerType[];
};

export default function LineupCreator({ players }: Props) {
  const searchParams = useSearchParams();
  const [lineup, setLineup] = useState<LineupSpot[]>(DEFAULT_LINEUP);
  const [startingPitcher, setStartingPitcher] = useState<PlayerType | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [hasDH, setHasDH] = useState(false);
  const [isFarmMode, setIsFarmMode] = useState(false);
  const [nameDisplay, setNameDisplay] = useState<NameDisplayMode>("kanji");
  const [customTitle, setCustomTitle] = useState("");
  const lineupTableRef = useRef<HTMLDivElement>(null);
  const [isForImage, setIsForImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const initializedRef = useRef(false);
  const isRestoringRef = useRef(false);

  // URLパラメータからラインナップを復元
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const decoded = decodeLineupParams(searchParams, players);
    if (!decoded) return;
    isRestoringRef.current = true;
    setLineup(decoded.lineup);
    setStartingPitcher(decoded.startingPitcher);
    setHasDH(decoded.hasDH);
    setIsFarmMode(decoded.isFarmMode);
    setNameDisplay(decoded.nameDisplay);
    setCustomTitle(decoded.customTitle);
    requestAnimationFrame(() => {
      isRestoringRef.current = false;
    });
  }, [searchParams, players]);

  // クライアントサイドでのみレンダリングするためのフラグ
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // DHありなしが変更されたときにラインナップを更新
  useEffect(() => {
    if (isRestoringRef.current) return;
    if (hasDH) {
      // DHありの場合、投手を打順から外し、DHを追加
      setLineup((prevLineup) => {
        const newLineup = prevLineup.filter((spot) => spot.position !== "投手");
        // DHが既に存在するか確認
        const dhExists = newLineup.some((spot) => spot.position === "DH");
        if (!dhExists) {
          newLineup.push({ order: null, player: null, position: "DH" });
        }
        return newLineup;
      });
    } else {
      // DHなしの場合、DHを非表示にし、投手を追加
      setLineup((prevLineup) => {
        const newLineup = prevLineup.filter((spot) => spot.position !== "DH");
        // 投手が既に存在するか確認
        const pitcherExists = newLineup.some(
          (spot) => spot.position === "投手",
        );
        if (!pitcherExists) {
          newLineup.push({
            order: null,
            player: startingPitcher,
            position: "投手",
          });
        }
        return newLineup;
      });
    }
  }, [hasDH, startingPitcher]);

  // useMemoを使用してorderedPlayersを最適化し、不要な再レンダリングを防ぐ
  const orderedPlayers = useMemo(() => {
    return lineup
      .filter((spot) => spot.order !== null && spot.player !== null)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [lineup]);

  // 選手を選択したときの処理
  const handleSelectPlayer = (
    position: Position,
    player: PlayerType | null,
  ) => {
    setLineup((prevLineup) =>
      prevLineup.map((spot) =>
        spot.position === position ? { ...spot, player } : spot,
      ),
    );
  };

  // 先発投手を選択したときの処理
  const handleSelectPitcher = (player: PlayerType | null) => {
    setStartingPitcher(player);

    // 投手ポジションの選手も更新
    setLineup((prevLineup) =>
      prevLineup.map((spot) =>
        spot.position === "投手" ? { ...spot, player } : spot,
      ),
    );
  };

  // 打順を選択したときの処理
  const handleSelectOrder = (position: Position, order: number | null) => {
    setLineup((prevLineup) => {
      // 同じ打順が既に他のポジションに設定されている場合、その打順をnullにする
      const updatedLineup = prevLineup.map((spot) => {
        if (spot.order === order && spot.position !== position) {
          return { ...spot, order: null };
        }
        return spot;
      });

      // 選択されたポジションの打順を更新
      return updatedLineup.map((spot) =>
        spot.position === position ? { ...spot, order } : spot,
      );
    });
  };

  // 打順リスト内で選手を移動し、打順を1から振り直す
  const reorderPlayers = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      toIndex < 0 ||
      toIndex >= orderedPlayers.length
    ) {
      return;
    }

    const itemsCopy = [...orderedPlayers];
    const [reorderedItem] = itemsCopy.splice(fromIndex, 1);
    itemsCopy.splice(toIndex, 0, reorderedItem);

    const updatedItems = itemsCopy.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    const updatedLineup = lineup.map((spot) => {
      const foundItem = updatedItems.find(
        (item) => item.position === spot.position,
      );
      if (foundItem) {
        return { ...spot, order: foundItem.order };
      }
      return spot;
    });

    setLineup(updatedLineup);
  };

  // ドラッグ＆ドロップ終了時の処理
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    reorderPlayers(source.index, destination.index);
  };

  // ラインナップをリセットする（DHあり設定を保ったままリセット）
  const resetLineup = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("ラインナップをリセットしますか？")
    ) {
      return;
    }
    const baseLineup = hasDH
      ? [
          ...DEFAULT_LINEUP.filter((spot) => spot.position !== "投手"),
          { order: null, player: null, position: "DH" as Position },
        ]
      : DEFAULT_LINEUP;
    setLineup(baseLineup);
    setStartingPitcher(null);
  };

  // 表示用に並び替えられたラインナップを取得
  const getSortedLineup = () => {
    const withOrder = lineup
      .filter((spot) => spot.order !== null)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const withoutOrder = lineup.filter((spot) => spot.order === null);
    return [...withOrder, ...withoutOrder];
  };

  // 選手を打順に追加する
  const addPlayerToOrder = (position: Position) => {
    const spot = lineup.find((s) => s.position === position);
    if (!spot || !spot.player) return;

    // 既に打順が設定されている場合は何もしない
    if (spot.order !== null) return;

    // 次の利用可能な打順を取得
    const usedOrders = lineup
      .filter((s) => s.order !== null)
      .map((s) => s.order);
    for (let i = 1; i <= 9; i++) {
      if (!usedOrders.includes(i)) {
        handleSelectOrder(position, i);
        break;
      }
    }
  };

  // 選手を打順から削除する
  const removePlayerFromOrder = (position: Position) => {
    handleSelectOrder(position, null);
  };

  // ドラッグ＆ドロップUIが表示されるかどうか
  const showDragDropUI = orderedPlayers.length > 0 && isMounted;

  // 選手名表示関数
  const getDisplayName = useCallback(
    (player: PlayerType | null): string => {
      if (!player) return "未選択";
      return getDisplayNameBase(player, nameDisplay);
    },
    [nameDisplay],
  );

  // 選手フィルター関数
  const filterPlayersByMode = useCallback(
    (playersList: PlayerType[]) => {
      if (isFarmMode) {
        return playersList.filter(
          (p) => p.role === Role.Roster || p.role === Role.Training,
        );
      } else {
        return playersList.filter((p) => p.role === Role.Roster);
      }
    },
    [isFarmMode],
  );

  // 既にどこかで選択済みの選手は他のポジションの候補から外す
  const selectablePlayers = useMemo(() => {
    const playerKey = (player: PlayerType) =>
      `${player.number_disp}-${player.name}`;
    const usedKeys = new Set<string>();
    lineup.forEach((spot) => {
      if (spot.player) usedKeys.add(playerKey(spot.player));
    });
    if (startingPitcher) usedKeys.add(playerKey(startingPitcher));
    return filterPlayersByMode(players).filter(
      (p) => !usedKeys.has(playerKey(p)),
    );
  }, [filterPlayersByMode, players, lineup, startingPitcher]);

  const saveAsImage = useCallback(async () => {
    if (!lineupTableRef.current) return;

    try {
      setIsForImage(true);
      // 非同期処理の後に状態を確実に更新するために少し遅延を入れる
      await new Promise((resolve) => setTimeout(resolve, 50));

      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(lineupTableRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      const fileName = customTitle
        ? `${customTitle}.png`
        : TEAM.lineup.imageFileName;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
      sendGAEvent("event", "lineup_save_image", {
        player_count: orderedPlayers.length,
        has_dh: hasDH,
      });
    } catch (error) {
      console.error("Failed to save image:", error);
    } finally {
      setIsForImage(false);
    }
  }, [lineupTableRef, customTitle, orderedPlayers.length, hasDH]);

  const handleShareLink = useCallback(async () => {
    const params = encodeLineupParams({
      lineup,
      startingPitcher,
      hasDH,
      isFarmMode,
      nameDisplay,
      customTitle,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API が使えない環境（HTTP等）ではフォールバック
      console.warn("Clipboard API not available");
    }
    sendGAEvent("event", "lineup_share_link", {
      player_count: orderedPlayers.length,
      has_dh: hasDH,
    });
  }, [
    lineup,
    startingPitcher,
    hasDH,
    isFarmMode,
    nameDisplay,
    customTitle,
    orderedPlayers.length,
  ]);

  const getShareUrl = useCallback(() => {
    const params = encodeLineupParams({
      lineup,
      startingPitcher,
      hasDH,
      isFarmMode,
      nameDisplay,
      customTitle,
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [lineup, startingPitcher, hasDH, isFarmMode, nameDisplay, customTitle]);

  const getShareText = useCallback(() => {
    const title = customTitle || TEAM.lineup.defaultTitle;
    const lines = orderedPlayers.map(
      (spot) =>
        `${spot.order}. ${getDisplayName(spot.player)} (${spot.position})`,
    );
    const pitcher = startingPitcher
      ? `先発: ${getDisplayName(startingPitcher)}`
      : "";
    return [title, ...lines, pitcher].filter(Boolean).join("\n");
  }, [orderedPlayers, startingPitcher, customTitle, getDisplayName]);

  const handleShareTwitter = useCallback(() => {
    const text = getShareText();
    const url = getShareUrl();
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
    sendGAEvent("event", "lineup_share_twitter", {
      player_count: orderedPlayers.length,
    });
  }, [getShareText, getShareUrl, orderedPlayers.length]);

  const handleNativeShare = useCallback(async () => {
    const text = getShareText();
    const url = getShareUrl();
    try {
      await navigator.share({
        title: customTitle || TEAM.lineup.defaultTitle,
        text,
        url,
      });
      sendGAEvent("event", "lineup_share_native", {
        player_count: orderedPlayers.length,
      });
    } catch {
      // user cancelled or not supported
    }
  }, [getShareText, getShareUrl, customTitle, orderedPlayers.length]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="w-full max-w-[800px] border rounded-lg mb-4"
        style={{
          backgroundColor: "var(--surface-brand)",
          borderColor: "var(--border-brand)",
        }}
      >
        <button
          className="flex items-center justify-between w-full min-h-11 p-4 cursor-pointer font-bold text-base bg-transparent border-none text-[var(--text-primary)]"
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-expanded={settingsOpen}
        >
          <Ruby reading="せってい">設定</Ruby>
          {settingsOpen ? (
            <FiChevronDown aria-hidden="true" />
          ) : (
            <FiChevronRight aria-hidden="true" />
          )}
        </button>
        {settingsOpen && (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <Switch
              checked={hasDH}
              onCheckedChange={(e) => setHasDH(e.checked)}
            >
              DHあり
            </Switch>

            <Switch
              checked={isFarmMode}
              onCheckedChange={(e) => setIsFarmMode(e.checked)}
            >
              <Ruby reading="いくせいわく">育成枠</Ruby>
              <Ruby reading="ふく">含</Ruby>む(ファーム
              <Ruby reading="たいおう">対応</Ruby>)
            </Switch>

            <div>
              <p className="mb-2">
                <Ruby reading="せんしゅめい">選手名</Ruby>の
                <Ruby reading="ひょうじ">表示</Ruby>
              </p>
              <OptionGroup
                name="nameDisplay"
                options={NAME_DISPLAY_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: <Ruby reading={opt.reading}>{opt.label}</Ruby>,
                }))}
                selectedValues={[nameDisplay]}
                onChange={(value) => setNameDisplay(value as NameDisplayMode)}
              />
            </div>

            <div>
              <label htmlFor="lineup-custom-title" className="block mb-2">
                スタメン<Ruby reading="ひょう">表</Ruby>の
                <Ruby reading="なまえ">名前</Ruby>
              </label>
              <input
                id="lineup-custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="表のタイトルを入力"
                className="w-full max-w-[500px] min-h-11 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
                style={{
                  borderColor: "var(--border-card)",
                  backgroundColor: "var(--surface-card-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-[800px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">スターティングメンバー</h3>
          <div className="flex gap-1 items-center">
            <button
              onClick={handleShareLink}
              aria-label="URLをコピー"
              className="flex items-center justify-center min-w-11 min-h-11 bg-transparent border-none cursor-pointer text-[var(--interactive-primary)] hover:bg-[var(--surface-brand)] rounded-md"
            >
              {copied ? (
                <FiCheck size={20} color="var(--text-success)" />
              ) : (
                <FiLink size={20} />
              )}
            </button>
            <button
              onClick={handleShareTwitter}
              aria-label="Xで共有"
              className="flex items-center justify-center min-w-11 min-h-11 bg-transparent border-none cursor-pointer text-[var(--interactive-primary)] hover:bg-[var(--surface-brand)] rounded-md"
            >
              <FaXTwitter size={20} />
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={handleNativeShare}
                aria-label="共有"
                className="flex items-center justify-center min-w-11 min-h-11 bg-transparent border-none cursor-pointer text-[var(--interactive-primary)] hover:bg-[var(--surface-brand)] rounded-md"
              >
                <FiShare2 size={20} />
              </button>
            )}
            <button
              className="flex items-center gap-2 px-3 min-h-11 rounded-md text-white text-sm border-none cursor-pointer bg-[var(--interactive-primary)] hover:bg-[var(--interactive-primary-hover)]"
              onClick={saveAsImage}
            >
              <FiDownload aria-hidden="true" />
              <span>
                <Ruby reading="がぞう">画像</Ruby>として
                <Ruby reading="ほぞん">保存</Ruby>
              </span>
            </button>
          </div>
        </div>
        <div ref={lineupTableRef}>
          <LineupTable
            lineup={getSortedLineup()}
            startingPitcher={startingPitcher}
            getDisplayName={getDisplayName}
            title={customTitle}
            isForImage={isForImage}
          />
        </div>
      </div>

      {showDragDropUI && isMounted && (
        <div className="w-full max-w-[800px] mb-4">
          <h3 className="text-lg font-semibold mb-4">
            <Ruby reading="だじゅん">打順</Ruby>（ドラッグ＆ドロップで
            <Ruby reading="なら">並</Ruby>べ<Ruby reading="か">替</Ruby>え）
          </h3>
          <DraggableLineup
            orderedPlayers={orderedPlayers}
            onDragEnd={handleDragEnd}
            onMove={(index, delta) => reorderPlayers(index, index + delta)}
            removePlayerFromOrder={removePlayerFromOrder}
            getDisplayName={getDisplayName}
          />
        </div>
      )}

      <div className="w-full max-w-[800px]">
        <div className="flex flex-col gap-4">
          {/* 先発投手選択は常に表示 */}
          <h3 className="text-lg font-semibold">
            <Ruby reading="とうしゅせんたく">投手選択</Ruby>
          </h3>
          <PlayerSelector
            players={selectablePlayers}
            onSelectPlayer={handleSelectPitcher}
            selectedPlayer={startingPitcher}
            position="投手"
            getDisplayName={getDisplayName}
          />

          <h3 className="text-lg font-semibold">
            ポジション<Ruby reading="べつ">別</Ruby>
            <Ruby reading="せんしゅせってい">選手設定</Ruby>
          </h3>
          {lineup.map((spot) => (
            <div
              key={spot.position}
              className="p-3 border rounded-md"
              style={{ borderColor: "var(--border-card)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">
                  <Ruby reading={POSITION_READINGS[spot.position]}>
                    {spot.position}
                  </Ruby>
                </span>
                {spot.order !== null ? (
                  <div className="flex items-center">
                    <span
                      className="font-bold"
                      style={{ color: "var(--interactive-primary)" }}
                    >
                      {spot.order}
                      <Ruby reading="ばん">番</Ruby>
                    </span>
                    <button
                      className="text-sm ml-2 px-3 min-h-11 text-red-600 hover:bg-red-50 rounded border border-red-300"
                      onClick={() => removePlayerFromOrder(spot.position)}
                    >
                      <Ruby reading="だじゅん">打順</Ruby>を
                      <Ruby reading="かいじょ">解除</Ruby>
                    </button>
                  </div>
                ) : (
                  spot.player && (
                    <button
                      className="text-sm px-3 min-h-11 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => addPlayerToOrder(spot.position)}
                      disabled={orderedPlayers.length >= 9}
                    >
                      <Ruby reading="だじゅん">打順</Ruby>に
                      <Ruby reading="ついか">追加</Ruby>
                    </button>
                  )
                )}
              </div>
              <PlayerSelector
                players={selectablePlayers}
                onSelectPlayer={(player: PlayerType | null) =>
                  handleSelectPlayer(spot.position, player)
                }
                selectedPlayer={spot.player}
                position={spot.position}
                getDisplayName={getDisplayName}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className="px-6 min-h-12 text-white rounded-md border-none cursor-pointer bg-red-600 hover:bg-red-700"
        onClick={resetLineup}
      >
        リセット
      </button>
    </div>
  );
}
