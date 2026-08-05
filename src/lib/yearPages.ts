import type { Metadata } from "next";
import { describe, type DescriptionKey } from "@/config/team";

// 年別ルートページ（/xxx/[year]）共通のボイラープレート

export function latestYear(years: readonly number[]): number {
  return Math.max(...years);
}

export function yearStaticParams(years: readonly number[]): { year: string }[] {
  return years.map((year) => ({ year: year.toString() }));
}

export function yearMetadata(title: string, key: DescriptionKey) {
  return async ({
    params,
  }: {
    params: Promise<{ year: string }>;
  }): Promise<Metadata> => {
    const { year } = await params;
    return {
      title: `${year}年 ${title}`,
      description: describe(key, { year }),
    };
  };
}
