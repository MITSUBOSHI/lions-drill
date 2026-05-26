"use client";

import {
  DEFAULT_ITEM_LABEL,
  type CustomLineupSpot,
} from "@/lib/lineupCustomUrl";

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
                <th className="text-left px-3 py-2 w-16">打順</th>
                <th className="text-left px-3 py-2">{displayItemLabel}</th>
                {hasMemo && <th className="text-left px-3 py-2">メモ・理由</th>}
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
                    {spot.name.trim() ? spot.name : "未入力"}
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
            {displayItemLabel}が入力されていません
          </p>
        </div>
      )}

      {!isForImage && filledCount > 0 && filledCount < 9 && (
        <div
          className="mt-4 p-2 rounded-md"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            残り{9 - filledCount}枠が未入力です
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
            打順設定完了 ⚾
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
