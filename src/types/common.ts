export type NameDisplayMode = "kanji" | "kana" | "both";

export const NAME_DISPLAY_OPTIONS = [
  { value: "kanji", label: "漢字のみ" },
  { value: "kana", label: "ひらがなのみ" },
  { value: "both", label: "両方" },
] as const;

export type Position =
  | "投手"
  | "捕手"
  | "一塁手"
  | "二塁手"
  | "三塁手"
  | "遊撃手"
  | "左翼手"
  | "中堅手"
  | "右翼手"
  | "DH";
