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
};

const allNavItems: NavItem[] = [
  {
    title: "選手名鑑",
    titleReading: "せんしゅめいかん",
    href: `/player-directory/${maxYear}`,
    icon: "📖",
  },
  {
    title: "背番号計算ドリル",
    titleReading: "せばんごうけいさんどりる",
    href: `/number-drill/${maxYear}`,
    icon: "🖋",
  },
  {
    title: "スタメン作成",
    titleReading: "すためんさくせい",
    href: `/lineup-maker/${maxYear}`,
    icon: "⚾",
  },
  {
    title: "ユニフォームビュー",
    titleReading: "ゆにふぉーむびゅー",
    href: `/uniform-view/${maxYear}`,
    icon: "👕",
  },
  {
    title: "背番号タイマー",
    titleReading: "せばんごうたいまー",
    href: `/number-count/${maxYear}`,
    icon: "🔢",
  },
  {
    title: "応援歌",
    titleReading: "おうえんか",
    href: `/cheer-songs/${maxYear}`,
    icon: "🎵",
  },
  {
    title: "ドラフト一覧",
    titleReading: "どらふといちらん",
    href: `/draft/${maxDraftYear}`,
    icon: "📋",
  },
];

export const navItems: readonly NavItem[] = allNavItems.filter((item) => {
  if (item.title === "応援歌" && !TEAM.features.cheerSongs) return false;
  return true;
});
