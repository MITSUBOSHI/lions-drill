"use client";

import { PlayerType } from "@/types/Player";
import { LineupSpot } from "./LineupCreator";

type Props = {
  lineup: LineupSpot[];
  startingPitcher: PlayerType | null;
  getDisplayName: (player: PlayerType | null) => string;
  title?: string;
  isForImage?: boolean;
};

export default function LineupTable({
  lineup,
  startingPitcher,
  getDisplayName,
  title = "スタメンジェネレータ",
  isForImage = false,
}: Props) {
  const activeLineup = lineup.filter((spot) => spot.order !== null);
  const unassignedCount = lineup.filter((spot) => spot.order === null).length;
  const textColor = isForImage ? "black" : "var(--text-primary)";

  return (
    <div
      className="border rounded-lg overflow-hidden p-4"
      style={{ borderColor: "var(--border-card)" }}
    >
      <div className="flex justify-between mb-4">
        <span className="text-xl font-bold" style={{ color: textColor }}>
          {title}
        </span>
        <div>
          <span className="text-sm" style={{ color: textColor }}>
            先発投手:
          </span>
          <span
            className={`inline-block text-base px-2 rounded ${isForImage ? "pb-2" : ""}`}
            style={{ backgroundColor: "#e5e7eb", color: textColor }}
          >
            {startingPitcher ? getDisplayName(startingPitcher) : "未選択"}
          </span>
        </div>
      </div>

      {activeLineup.length > 0 ? (
        <div className="overflow-x-auto" style={{ color: textColor }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-card)]">
                <th className="text-left px-3 py-2 w-16">打順</th>
                <th className="text-left px-3 py-2 w-16">位置</th>
                <th className="text-left px-3 py-2">選手名</th>
                <th className="text-left px-3 py-2 w-20">背番号</th>
              </tr>
            </thead>
            <tbody>
              {activeLineup.map((spot) => (
                <tr
                  key={spot.position}
                  style={{
                    backgroundColor: isForImage
                      ? spot.order && spot.order % 2 === 0
                        ? "#f7fafc"
                        : "white"
                      : spot.order && spot.order % 2 === 0
                        ? "var(--surface-card)"
                        : "var(--surface-card-subtle)",
                    color: textColor,
                  }}
                  className="border-b border-[var(--border-card)]"
                >
                  <td className="px-3 py-2">{spot.order}</td>
                  <td className="px-3 py-2">{spot.position[0]}</td>
                  <td className="px-3 py-2">
                    {spot.player ? getDisplayName(spot.player) : "未選択"}
                  </td>
                  <td className="px-3 py-2">
                    {spot.player ? spot.player.number_disp : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-4">
          <p style={{ color: "var(--text-secondary)" }}>
            打順が設定されていません
          </p>
        </div>
      )}

      {!isForImage && unassignedCount > 0 && activeLineup.length > 0 && (
        <div
          className="mt-4 p-2 rounded-md"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            残り{unassignedCount}ポジションが打順未設定です
          </p>
        </div>
      )}

      {!isForImage && activeLineup.length === 9 && (
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
