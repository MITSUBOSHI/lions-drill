import type { PlayerType } from "@/types/Player";
import type { NameDisplayMode } from "@/types/common";

export function getDisplayName(
  player: PlayerType,
  mode: NameDisplayMode,
): string {
  switch (mode) {
    case "kanji":
      return player.name;
    case "kana":
      return player.name_kana;
    case "both":
      return `${player.name}（${player.name_kana}）`;
  }
}

export function extractFamilyNameKana(nameKana: string): string {
  if (nameKana.includes("\u30FB")) {
    // 外国人選手: 中黒区切りの末尾が姓
    // 例: "あんどれ・じゃくそん" → "じゃくそん"
    const parts = nameKana.split("\u30FB");
    return parts[parts.length - 1];
  }
  // 日本人選手: スペース区切りの先頭が姓
  // 例: "くわはら まさゆき" → "くわはら"
  // 単名: "はやて" → "はやて"
  return nameKana.split(" ")[0];
}
