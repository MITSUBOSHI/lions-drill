"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import Ruby from "@/components/common/Ruby";
import {
  CUSTOM_NAME_MAX_LENGTH,
  CUSTOM_MEMO_MAX_LENGTH,
  CUSTOM_TITLE_MAX_LENGTH,
  CUSTOM_ITEM_LABEL_MAX_LENGTH,
  DEFAULT_ITEM_LABEL,
  type CustomLineupSpot,
  createDefaultCustomLineup,
  encodeCustomLineupParams,
  decodeCustomLineupParams,
} from "@/lib/lineupCustomUrl";
import LineupCustomTable from "./LineupCustomTable";

export default function LineupCustomCreator() {
  const searchParams = useSearchParams();
  const [lineup, setLineup] = useState<CustomLineupSpot[]>(
    createDefaultCustomLineup,
  );
  const [customTitle, setCustomTitle] = useState("");
  const [itemLabel, setItemLabel] = useState("");
  const [showMemo, setShowMemo] = useState(false);
  const [isForImage, setIsForImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lineupTableRef = useRef<HTMLDivElement>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const decoded = decodeCustomLineupParams(searchParams);
    if (!decoded) return;
    setLineup(decoded.lineup);
    setCustomTitle(decoded.customTitle);
    setItemLabel(decoded.itemLabel);
    if (decoded.lineup.some((spot) => spot.memo.trim() !== "")) {
      setShowMemo(true);
    }
  }, [searchParams]);

  const displayItemLabel = itemLabel.trim() || DEFAULT_ITEM_LABEL;

  const filledCount = lineup.filter((spot) => spot.name.trim() !== "").length;

  const handleNameChange = (order: number, value: string) => {
    setLineup((prev) =>
      prev.map((spot) =>
        spot.order === order
          ? { ...spot, name: value.slice(0, CUSTOM_NAME_MAX_LENGTH) }
          : spot,
      ),
    );
  };

  const handleMemoChange = (order: number, value: string) => {
    setLineup((prev) =>
      prev.map((spot) =>
        spot.order === order
          ? { ...spot, memo: value.slice(0, CUSTOM_MEMO_MAX_LENGTH) }
          : spot,
      ),
    );
  };

  const resetLineup = () => {
    setLineup(createDefaultCustomLineup());
    setCustomTitle("");
    setItemLabel("");
    setShowMemo(false);
  };

  const saveAsImage = useCallback(async () => {
    if (!lineupTableRef.current) return;

    try {
      setIsForImage(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(lineupTableRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      const fileName = customTitle ? `${customTitle}.png` : "custom-lineup.png";
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
      sendGAEvent("event", "lineup_custom_save_image", {
        filled_count: filledCount,
      });
    } catch (error) {
      console.error("Failed to save image:", error);
    } finally {
      setIsForImage(false);
    }
  }, [customTitle, filledCount]);

  const getShareUrl = useCallback(() => {
    const params = encodeCustomLineupParams({
      lineup,
      customTitle,
      itemLabel,
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [lineup, customTitle, itemLabel]);

  const getShareText = useCallback(() => {
    const title = customTitle || "カスタムスタメン";
    const lines = lineup
      .filter((spot) => spot.name.trim() !== "")
      .map((spot) => {
        const base = `${spot.order}. ${spot.name}`;
        return spot.memo.trim() ? `${base}（${spot.memo}）` : base;
      });
    return [title, ...lines].join("\n");
  }, [lineup, customTitle]);

  const handleShareLink = useCallback(async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.warn("Clipboard API not available");
    }
    sendGAEvent("event", "lineup_custom_share_link", {
      filled_count: filledCount,
    });
  }, [getShareUrl, filledCount]);

  const handleShareTwitter = useCallback(() => {
    const text = getShareText();
    const url = getShareUrl();
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
    sendGAEvent("event", "lineup_custom_share_twitter", {
      filled_count: filledCount,
    });
  }, [getShareText, getShareUrl, filledCount]);

  const handleNativeShare = useCallback(async () => {
    const text = getShareText();
    const url = getShareUrl();
    try {
      await navigator.share({
        title: customTitle || "カスタムスタメン",
        text,
        url,
      });
      sendGAEvent("event", "lineup_custom_share_native", {
        filled_count: filledCount,
      });
    } catch {
      // user cancelled or not supported
    }
  }, [getShareText, getShareUrl, customTitle, filledCount]);

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
          className="flex items-center justify-between w-full p-4 min-h-11 cursor-pointer font-bold text-base bg-transparent border-none text-[var(--text-primary)]"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <Ruby reading="せってい">設定</Ruby>
          {settingsOpen ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        {settingsOpen && (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div>
              <label className="block mb-2" htmlFor="lineup-custom-title">
                スタメン<Ruby reading="ひょう">表</Ruby>の
                <Ruby reading="なまえ">名前</Ruby>
              </label>
              <input
                id="lineup-custom-title"
                value={customTitle}
                onChange={(e) =>
                  setCustomTitle(
                    e.target.value.slice(0, CUSTOM_TITLE_MAX_LENGTH),
                  )
                }
                placeholder="例: 2024年私的ニューススタメン"
                maxLength={CUSTOM_TITLE_MAX_LENGTH}
                className="w-full max-w-[500px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
                style={{
                  borderColor: "var(--border-card)",
                  backgroundColor: "var(--surface-card-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block mb-2" htmlFor="lineup-custom-item-label">
                <Ruby reading="こうもく">項目</Ruby>ラベル（
                {CUSTOM_ITEM_LABEL_MAX_LENGTH}
                <Ruby reading="じいない">字以内</Ruby>・
                <Ruby reading="くうらん">空欄</Ruby>なら「
                {DEFAULT_ITEM_LABEL}」）
              </label>
              <input
                id="lineup-custom-item-label"
                value={itemLabel}
                onChange={(e) =>
                  setItemLabel(
                    e.target.value.slice(0, CUSTOM_ITEM_LABEL_MAX_LENGTH),
                  )
                }
                placeholder="例: 選手名 / ニュース / 商品名"
                maxLength={CUSTOM_ITEM_LABEL_MAX_LENGTH}
                className="w-full max-w-[500px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
                style={{
                  borderColor: "var(--border-card)",
                  backgroundColor: "var(--surface-card-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <Switch
              checked={showMemo}
              onCheckedChange={(e) => setShowMemo(e.checked)}
            >
              メモ・<Ruby reading="りゆう">理由</Ruby>を
              <Ruby reading="にゅうりょく">入力</Ruby>する
            </Switch>
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
              className="flex items-center gap-2 px-3 min-h-11 rounded-md text-white text-sm border-none cursor-pointer"
              style={{ backgroundColor: "var(--interactive-primary)" }}
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
          <LineupCustomTable
            lineup={lineup}
            title={customTitle}
            itemLabel={itemLabel}
            isForImage={isForImage}
          />
        </div>
      </div>

      <div className="w-full max-w-[800px]">
        <h3 className="text-lg font-semibold mb-4">
          <Ruby reading="だじゅん">打順</Ruby>
          <Ruby reading="にゅうりょく">入力</Ruby>
        </h3>
        <div className="flex flex-col gap-4">
          {lineup.map((spot) => (
            <div
              key={spot.order}
              className="p-3 border rounded-md"
              style={{ borderColor: "var(--border-card)" }}
            >
              <div className="flex items-center mb-2">
                <span
                  className="font-bold"
                  style={{ color: "var(--interactive-primary)" }}
                >
                  {spot.order}
                  <Ruby reading="ばん">番</Ruby>
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label
                    className="block text-sm mb-1"
                    style={{ color: "var(--text-secondary)" }}
                    htmlFor={`name-${spot.order}`}
                  >
                    {displayItemLabel}（{CUSTOM_NAME_MAX_LENGTH}
                    <Ruby reading="じいない">字以内</Ruby>）
                  </label>
                  <input
                    id={`name-${spot.order}`}
                    type="text"
                    value={spot.name}
                    onChange={(e) =>
                      handleNameChange(spot.order, e.target.value)
                    }
                    placeholder={`${displayItemLabel}を入力`}
                    maxLength={CUSTOM_NAME_MAX_LENGTH}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
                    style={{
                      borderColor: "var(--border-card)",
                      backgroundColor: "var(--surface-card-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <p
                    className="text-xs text-right mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {spot.name.length}/{CUSTOM_NAME_MAX_LENGTH}
                  </p>
                </div>
                {showMemo && (
                  <div>
                    <label
                      className="block text-sm mb-1"
                      style={{ color: "var(--text-secondary)" }}
                      htmlFor={`memo-${spot.order}`}
                    >
                      メモ・<Ruby reading="りゆう">理由</Ruby>（
                      <Ruby reading="にんい">任意</Ruby>・
                      {CUSTOM_MEMO_MAX_LENGTH}
                      <Ruby reading="じいない">字以内</Ruby>）
                    </label>
                    <textarea
                      id={`memo-${spot.order}`}
                      value={spot.memo}
                      onChange={(e) =>
                        handleMemoChange(spot.order, e.target.value)
                      }
                      placeholder="メモや起用理由など"
                      maxLength={CUSTOM_MEMO_MAX_LENGTH}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] resize-y"
                      style={{
                        borderColor: "var(--border-card)",
                        backgroundColor: "var(--surface-card-subtle)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <p
                      className="text-xs text-right mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {spot.memo.length}/{CUSTOM_MEMO_MAX_LENGTH}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="px-4 py-2 min-h-11 text-white rounded-md border-none cursor-pointer"
        style={{ backgroundColor: "#dc2626" }}
        onClick={resetLineup}
      >
        リセット
      </button>
    </div>
  );
}
