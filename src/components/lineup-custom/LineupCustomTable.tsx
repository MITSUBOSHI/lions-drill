"use client";

import {
  DEFAULT_ITEM_LABEL,
  type CustomLineupSpot,
} from "@/lib/lineupCustomUrl";
import Ruby from "@/components/common/Ruby";

type Props = {
  lineup: CustomLineupSpot[];
  title?: string;
  itemLabel?: string;
  isForImage?: boolean;
};

export default function LineupCustomTable({
  lineup,
  title = "スタメンジェネレータ",
  itemLabel,
  isForImage = false,
}: Props) {
  const filledCount = lineup.filter((spot) => spot.name.trim() !== "").length;
  const textColor = isForImage ? "black" : "var(--text-primary)";
  const hasMemo = lineup.some((spot) => spot.memo.trim() !== "");
  const displayItemLabel = (itemLabel?.trim() || DEFAULT_ITEM_LABEL).slice(
    0,
    20,
  );

  // html2canvas で画像化する際はルビを含めない
  const withRuby = (text: string, reading: string) =>
    isForImage ? text : <Ruby reading={reading}>{text}</Ruby>;

  return (
    <div
      className="border rounded-lg overflow-hidden p-4"
      style={{ borderColor: "var(--border-card)" }}
    >
      <div className="flex justify-between mb-4">
        <span className="text-xl font-bold" style={{ color: textColor }}>
          {title}
        </span>
      </div>

      {filledCount > 0 ? (
        <div className="overflow-x-auto" style={{ color: textColor }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-card)]">
                <th className="text-left px-3 py-2 w-16">
                  {withRuby("打順", "だじゅん")}
                </th>
                <th className="text-left px-3 py-2">{displayItemLabel}</th>
                {hasMemo && (
                  <th className="text-left px-3 py-2">
                    メモ・{withRuby("理由", "りゆう")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {lineup.map((spot) => (
                <tr
                  key={spot.order}
                  style={{
                    backgroundColor: isForImage
                      ? spot.order % 2 === 0
                        ? "#f7fafc"
                        : "white"
                      : spot.order % 2 === 0
                        ? "var(--surface-card)"
                        : "var(--surface-card-subtle)",
                    color: textColor,
                  }}
                  className="border-b border-[var(--border-card)]"
                >
                  <td className="px-3 py-2">{spot.order}</td>
                  <td className="px-3 py-2 break-words">
                    {spot.name.trim()
                      ? spot.name
                      : withRuby("未入力", "みにゅうりょく")}
                  </td>
                  {hasMemo && (
                    <td
                      className="px-3 py-2 break-words"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {spot.memo}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-4">
          <p style={{ color: "var(--text-secondary)" }}>
            {displayItemLabel}が{withRuby("入力", "にゅうりょく")}
            されていません
          </p>
        </div>
      )}

      {!isForImage && filledCount > 0 && filledCount < 9 && (
        <div
          className="mt-4 p-2 rounded-md"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <Ruby reading="のこ">残</Ruby>り{9 - filledCount}
            <Ruby reading="わく">枠</Ruby>が
            <Ruby reading="みにゅうりょく">未入力</Ruby>です
          </p>
        </div>
      )}

      {!isForImage && filledCount === 9 && (
        <div
          className="mt-4 p-2 rounded-md"
          style={{ backgroundColor: "var(--surface-success)" }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: "var(--text-success)" }}
          >
            <Ruby reading="だじゅん">打順</Ruby>
            <Ruby reading="せってい">設定</Ruby>
            <Ruby reading="かんりょう">完了</Ruby> ⚾
          </p>
        </div>
      )}

      {isForImage && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Baystars Drill で作成
        </p>
      )}
    </div>
  );
}
