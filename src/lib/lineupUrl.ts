import type { Position, NameDisplayMode } from "@/types/common";
import type { PlayerType } from "@/types/Player";
import type { LineupSpot } from "@/components/lineup/LineupCreator";

export type LineupUrlState = {
  lineup: LineupSpot[];
  startingPitcher: PlayerType | null;
  hasDH: boolean;
  isFarmMode: boolean;
  nameDisplay: NameDisplayMode;
  customTitle: string;
};

const POSITION_TO_CODE: Record<Position, string> = {
  投手: "p",
  捕手: "c",
  一塁手: "f",
  二塁手: "n",
  三塁手: "t",
  遊撃手: "s",
  左翼手: "l",
  中堅手: "m",
  右翼手: "r",
  DH: "d",
};

const CODE_TO_POSITION: Record<string, Position> = Object.fromEntries(
  Object.entries(POSITION_TO_CODE).map(([k, v]) => [v, k as Position]),
) as Record<string, Position>;

const DEFAULT_POSITIONS: Position[] = [
  "投手",
  "捕手",
  "一塁手",
  "二塁手",
  "三塁手",
  "遊撃手",
  "左翼手",
  "中堅手",
  "右翼手",
];

const DH_POSITIONS: Position[] = [
  "捕手",
  "一塁手",
  "二塁手",
  "三塁手",
  "遊撃手",
  "左翼手",
  "中堅手",
  "右翼手",
  "DH",
];

export function encodeLineupParams(state: LineupUrlState): URLSearchParams {
  const params = new URLSearchParams();

  const entries = state.lineup
    .filter((spot) => spot.player !== null)
    .map((spot) => {
      const order = spot.order ?? 0;
      const code = POSITION_TO_CODE[spot.position];
      return `${order}${code}${spot.player!.number_disp}`;
    });

  if (entries.length > 0) {
    params.set("lineup", entries.join("."));
  }

  if (state.startingPitcher) {
    params.set("sp", state.startingPitcher.number_disp);
  }

  if (state.hasDH) params.set("dh", "1");
  if (state.isFarmMode) params.set("farm", "1");
  if (state.nameDisplay !== "kanji") params.set("name", state.nameDisplay);
  if (state.customTitle) params.set("title", state.customTitle);

  return params;
}

export function decodeLineupParams(
  params: URLSearchParams,
  players: PlayerType[],
): LineupUrlState | null {
  const lineupStr = params.get("lineup");
  if (!lineupStr) return null;

  const hasDH = params.get("dh") === "1";
  const isFarmMode = params.get("farm") === "1";
  const nameDisplay = (params.get("name") || "kanji") as NameDisplayMode;
  const customTitle = params.get("title") || "";
  const spNumber = params.get("sp");

  const playerMap = new Map<string, PlayerType>();
  for (const p of players) {
    playerMap.set(p.number_disp, p);
  }

  const entries = lineupStr.split(".");
  const parsedSpots: LineupSpot[] = [];
  const usedPositions = new Set<Position>();

  for (const entry of entries) {
    const match = entry.match(/^(\d+)([a-z])(.+)$/);
    if (!match) continue;

    const order = parseInt(match[1], 10);
    const posCode = match[2];
    const numberDisp = match[3];

    const position = CODE_TO_POSITION[posCode];
    if (!position) continue;

    const player = playerMap.get(numberDisp) ?? null;
    parsedSpots.push({
      order: order === 0 ? null : order,
      player,
      position,
    });
    usedPositions.add(position);
  }

  const allPositions = hasDH ? DH_POSITIONS : DEFAULT_POSITIONS;
  for (const pos of allPositions) {
    if (!usedPositions.has(pos)) {
      parsedSpots.push({ order: null, player: null, position: pos });
    }
  }

  const startingPitcher = spNumber ? (playerMap.get(spNumber) ?? null) : null;

  return {
    lineup: parsedSpots,
    startingPitcher,
    hasDH,
    isFarmMode,
    nameDisplay,
    customTitle,
  };
}
