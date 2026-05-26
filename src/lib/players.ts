import Players2020 from "@/data/2020-players.jsonl.json";
import Players2021 from "@/data/2021-players.jsonl.json";
import Players2022 from "@/data/2022-players.jsonl.json";
import Players2023 from "@/data/2023-players.jsonl.json";
import Players2024 from "@/data/2024-players.jsonl.json";
import Players2025 from "@/data/2025-players.jsonl.json";
import Players2026 from "@/data/2026-players.jsonl.json";
import { PlayerType, Year } from "@/types/Player";

const playersByYearMap: Record<Year, PlayerType[]> = {
  2020: Players2020 as PlayerType[],
  2021: Players2021 as PlayerType[],
  2022: Players2022 as PlayerType[],
  2023: Players2023 as PlayerType[],
  2024: Players2024 as PlayerType[],
  2025: Players2025 as PlayerType[],
  2026: Players2026 as PlayerType[],
};

export function playersByYear(year: Year): PlayerType[] {
  return playersByYearMap[year];
}
