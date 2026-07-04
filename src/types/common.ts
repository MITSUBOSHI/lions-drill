export type NameDisplayMode = "kanji" | "kana" | "both";

export const NAME_DISPLAY_OPTIONS = [
  { value: "kanji", label: "漢字のみ", reading: "かんじのみ" },
  { value: "kana", label: "ひらがなのみ", reading: "ひらがなのみ" },
  { value: "both", label: "両方", reading: "りょうほう" },
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

export const POSITION_READINGS: Record<Position, string> = {
  投手: "とうしゅ",
  捕手: "ほしゅ",
  一塁手: "いちるいしゅ",
  二塁手: "にるいしゅ",
  三塁手: "さんるいしゅ",
  遊撃手: "ゆうげきしゅ",
  左翼手: "さよくしゅ",
  中堅手: "ちゅうけんしゅ",
  右翼手: "うよくしゅ",
  DH: "でぃーえいち",
};
