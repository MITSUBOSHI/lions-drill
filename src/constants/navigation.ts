import { registeredYears } from "@/constants/player";
import { draftYears } from "@/constants/draft";
import { TEAM } from "@/config/team";

const maxYear = Math.max(...registeredYears);
const maxDraftYear = Math.max(...draftYears);

type NavItem = {
  title: string;
  titleReading: string;
  href: string;
  icon: string;
  description: string;
  descReading: string;
};

const allNavItems: NavItem[] = [
  {
    title: "選手名鑑",
    titleReading: "せんしゅめいかん",
    href: `/player-directory/${maxYear}`,
    icon: "📖",
    description: "背番号・選手情報を一覧で確認",
    descReading: "せばんごう・せんしゅじょうほうをいちらんでかくにん",
  },
  {
    title: "背番号計算ドリル",
    titleReading: "せばんごうけいさんどりる",
    href: `/number-drill/${maxYear}`,
    icon: "🖋",
    description: "背番号を使った計算問題に挑戦",
    descReading: "せばんごうをつかったけいさんもんだいにちょうせん",
  },
  {
    title: "スタメン作成",
    titleReading: "すためんさくせい",
    href: `/lineup-maker/${maxYear}`,
    icon: "⚾",
    description: "オリジナルのスタメンを組み立てよう",
    descReading: "おりじなるのすためんをくみたてよう",
  },
  {
    title: "ユニフォームビュー",
    titleReading: "ゆにふぉーむびゅー",
    href: `/uniform-view/${maxYear}`,
    icon: "👕",
    description: "ユニフォーム背面の選手名と背番号を表示",
    descReading: "ゆにふぉーむはいめんのせんしゅめいとせばんごうをひょうじ",
  },
  {
    title: "背番号タイマー",
    titleReading: "せばんごうたいまー",
    href: `/number-count/${maxYear}`,
    icon: "🔢",
    description: "秒数を選手名で読み上げてカウント",
    descReading: "びょうすうをせんしゅめいでよみあげてかうんと",
  },
  {
    title: "応援歌",
    titleReading: "おうえんか",
    href: `/cheer-songs/${maxYear}`,
    icon: "🎵",
    description: "選手の応援歌の歌詞を閲覧（ふりがな付き）",
    descReading: "せんしゅのおうえんかのかしをえつらん（ふりがなつき）",
  },
  {
    title: "ドラフト一覧",
    titleReading: "どらふといちらん",
    href: `/draft/${maxDraftYear}`,
    icon: "📋",
    description: "年別ドラフト指名選手を一覧で確認",
    descReading: "ねんべつどらふとしめいせんしゅをいちらんでかくにん",
  },
];

export const navItems: readonly NavItem[] = allNavItems.filter((item) => {
  if (item.title === "応援歌" && !TEAM.features.cheerSongs) return false;
  return true;
});
