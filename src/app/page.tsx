"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "./logo.png";
import { navItems } from "@/constants/navigation";
import Ruby from "@/components/common/Ruby";
import { TEAM } from "@/config/team";

const descriptionMap: Record<
  string,
  { description: string; descReading: string }
> = {
  選手名鑑: {
    description: "背番号・選手情報を一覧で確認",
    descReading: "せばんごう・せんしゅじょうほうをいちらんでかくにん",
  },
  背番号計算ドリル: {
    description: "背番号を使った計算問題に挑戦",
    descReading: "せばんごうをつかったけいさんもんだいにちょうせん",
  },
  スタメン作成: {
    description: "オリジナルのスタメンを組み立てよう",
    descReading: "おりじなるのすためんをくみたてよう",
  },
  ユニフォームビュー: {
    description: "ユニフォーム背面の選手名と背番号を表示",
    descReading: "ゆにふぉーむはいめんのせんしゅめいとせばんごうをひょうじ",
  },
  背番号タイマー: {
    description: "秒数を選手名で読み上げてカウント",
    descReading: "びょうすうをせんしゅめいでよみあげてかうんと",
  },
  応援歌: {
    description: "選手の応援歌の歌詞を閲覧（ふりがな付き）",
    descReading: "せんしゅのおうえんかのかしをえつらん（ふりがなつき）",
  },
  ドラフト一覧: {
    description: "年別ドラフト指名選手を一覧で確認",
    descReading: "ねんべつどらふとしめいせんしゅをいちらんでかくにん",
  },
};

const features = navItems.map((item) => ({
  ...item,
  ...descriptionMap[item.title],
}));

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 px-4">
      <Image src={Logo.src} width={160} height={160} alt={TEAM.logo.alt} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl font-bold">{TEAM.name}</h1>
        <p className="text-lg text-[var(--text-secondary)]">
          {TEAM.subtitleSegments.map((seg, i) =>
            seg.reading ? (
              <Ruby key={i} reading={seg.reading}>
                {seg.text}
              </Ruby>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[900px]">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <div className="p-6 border border-[var(--border-card)] rounded-lg bg-[var(--surface-card)] cursor-pointer transition-all duration-200 hover:border-[var(--interactive-primary)] hover:-translate-y-0.5 hover:shadow-md h-full">
              <div className="flex flex-col gap-3 items-start">
                <span className="text-3xl">{feature.icon}</span>
                <h2 className="text-lg font-bold">
                  <Ruby reading={feature.titleReading}>{feature.title}</Ruby>
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  <Ruby reading={feature.descReading}>
                    {feature.description}
                  </Ruby>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
