import { Suspense } from "react";
import type { Metadata } from "next";
import LineupCustomCreator from "@/components/lineup-custom/LineupCustomCreator";
import PageTitle from "@/components/common/PageTitle";

export const metadata: Metadata = {
  title: "スタメン作成（自由入力）",
  description:
    "1〜9番までの順番で項目を自由入力できるスタメン形式の作成ツール。選手名、ニュース、商品など何でも並べられる",
};

export default function Page() {
  return (
    <div className="flex flex-col items-center w-full gap-6 py-4">
      <PageTitle
        title="スタメン作成（自由入力）"
        reading="すためんさくせい（じゆうにゅうりょく）"
      />
      <p className="text-sm text-[var(--text-secondary)] text-center px-4 max-w-[800px]">
        選手名はもちろん、年間ニュース・お気に入り商品など、9番までの順番で何でも自由に並べられます
      </p>
      <div className="w-full max-w-full md:max-w-[800px] px-4">
        <Suspense>
          <LineupCustomCreator />
        </Suspense>
      </div>
    </div>
  );
}
