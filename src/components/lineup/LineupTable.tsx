"use client";

import { PlayerType } from "@/types/Player";
import { POSITION_READINGS } from "@/types/common";
import Ruby from "@/components/common/Ruby";
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
        <div>
          <span className="text-sm" style={{ color: textColor }}>
            {withRuby("先発投手", "せんぱつとうしゅ")}:
          </span>
          <span
            className={`inline-block text-base px-2 rounded ${isForImage ? "pb-2" : ""}`}
            style={{ backgroundColor: "#e5e7eb", color: textColor }}
          >
            {startingPitcher
              ? getDisplayName(startingPitcher)
              : withRuby("未選択", "みせんたく")}
          </span>
        </div>
      </div>

      {activeLineup.length > 0 ? (
        <div className="overflow-x-auto" style={{ color: textColor }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-card)]">
                <th className="text-left px-3 py-2 w-16">
                  {withRuby("打順", "だじゅん")}
                </th>
                <th className="text-left px-3 py-2 w-16">
                  {withRuby("位置", "いち")}
                </th>
                <th className="text-left px-3 py-2">
                  {withRuby("選手名", "せんしゅめい")}
                </th>
                <th className="text-left px-3 py-2 w-20">
                  {withRuby("背番号", "せばんごう")}
                </th>
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
                  <td className="px-3 py-2">
                    {withRuby(
                      spot.position[0],
                      POSITION_READINGS[spot.position],
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {spot.player
                      ? getDisplayName(spot.player)
                      : withRuby("未選択", "みせんたく")}
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
            {withRuby("打順", "だじゅん")}が{withRuby("設定", "せってい")}
            されていません
          </p>
        </div>
      )}

      {!isForImage && unassignedCount > 0 && activeLineup.length > 0 && (
        <div
          className="mt-4 p-2 rounded-md"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <Ruby reading="のこ">残</Ruby>り{unassignedCount}ポジションが
            <Ruby reading="だじゅん">打順</Ruby>
            <Ruby reading="みせってい">未設定</Ruby>です
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
