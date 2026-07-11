"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useFurigana } from "@/contexts/FuriganaContext";
import Ruby from "@/components/common/Ruby";
import { navItems } from "@/constants/navigation";

type BreadcrumbItemType = {
  label: string;
  reading?: string;
  href: string;
  isCurrentPage: boolean;
};

const pathMap: Record<string, { label: string; reading: string }> = {
  "player-directory": { label: "選手名鑑", reading: "せんしゅめいかん" },
  "number-drill": {
    label: "背番号計算ドリル",
    reading: "せばんごうけいさんどりる",
  },
  "lineup-maker": { label: "スタメン作成", reading: "すためんさくせい" },
  "lineup-custom-maker": {
    label: "スタメン作成（自由入力）",
    reading: "すためんさくせい（じゆうにゅうりょく）",
  },
  "uniform-view": {
    label: "ユニフォームビュー",
    reading: "ゆにふぉーむびゅー",
  },
  "number-count": { label: "背番号タイマー", reading: "せばんごうたいまー" },
  "cheer-songs": { label: "応援歌", reading: "おうえんか" },
  "uniform-number": { label: "背番号", reading: "せばんごう" },
  drill: { label: "計算ドリル", reading: "けいさんどりる" },
  gallery: { label: "選手名鑑", reading: "せんしゅめいかん" },
  lineup: { label: "スタメン作成", reading: "すためんさくせい" },
  draft: { label: "ドラフト一覧", reading: "どらふといちらん" },
};

function BreadcrumbLabel({
  label,
  reading,
}: {
  label: string;
  reading?: string;
}) {
  if (!reading) return <>{label}</>;
  return <Ruby reading={reading}>{label}</Ruby>;
}

export default function AppBreadcrumb() {
  const pathname = usePathname();
  const { furigana, setFurigana } = useFurigana();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split("/").filter(Boolean);

    const items: BreadcrumbItemType[] = [
      {
        label: "トップ",
        reading: "とっぷ",
        href: "/",
        isCurrentPage: pathname === "/",
      },
    ];

    let currentPath = "";
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const isLast = i === pathSegments.length - 1;

      const segment = pathSegments[i];
      const mapped = pathMap[segment];
      const label = mapped
        ? mapped.label
        : /^\d{4}$/.test(segment)
          ? `${segment}年`
          : segment;
      const reading = mapped
        ? mapped.reading
        : /^\d{4}$/.test(segment)
          ? `${segment}ねん`
          : undefined;

      items.push({
        label,
        reading,
        href: currentPath,
        isCurrentPage: isLast,
      });
    }

    return items;
  }, [pathname]);

  return (
    <div className="relative z-40" ref={menuRef}>
      <div className="flex w-[calc(100%-2rem)] max-w-[1120px] mx-auto mb-4 px-3 md:px-4 min-h-14 justify-between items-center gap-3 rounded-2xl bg-[var(--surface-card-subtle)] border border-[var(--border-card)] shadow-[0_5px_20px_rgba(0,45,95,0.12)] backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            className="flex md:hidden items-center justify-center min-w-11 min-h-11 bg-[var(--surface-brand)] rounded-xl border-none cursor-pointer text-[var(--interactive-primary)]"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {breadcrumbItems.length > 1 ? (
            <nav
              aria-label="パンくずリスト"
              className="hidden min-w-0 flex-1 overflow-hidden md:block"
            >
              <ol className="flex min-w-max items-center gap-2 whitespace-nowrap list-none">
                {breadcrumbItems.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span
                        className="mx-2 text-[var(--text-secondary)]"
                        aria-hidden="true"
                      >
                        &gt;
                      </span>
                    )}
                    {item.isCurrentPage ? (
                      <span
                        className="font-bold text-[var(--interactive-primary)]"
                        aria-current="page"
                      >
                        <BreadcrumbLabel
                          label={item.label}
                          reading={item.reading}
                        />
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] hover:underline"
                      >
                        <BreadcrumbLabel
                          label={item.label}
                          reading={item.reading}
                        />
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <div />
          )}
        </div>

        <button
          className={`text-sm font-bold rounded-xl px-4 min-h-11 border-2 cursor-pointer transition-colors shrink-0 ${
            furigana
              ? "bg-[var(--interactive-primary)] text-white border-[var(--interactive-primary)]"
              : "bg-transparent text-[var(--interactive-primary)] border-[var(--interactive-primary)]"
          }`}
          onClick={() => setFurigana(!furigana)}
          aria-pressed={furigana}
          aria-label="ふりがなモード切り替え"
        >
          ふりがな{furigana ? "ON" : "OFF"}
        </button>
      </div>

      {menuOpen && (
        <div className="block md:hidden absolute top-full left-0 right-0 z-50 bg-[var(--surface-card)] border-b border-[var(--border-card)] shadow-md">
          <nav aria-label="メニュー" className="flex flex-col">
            <Link
              href="/"
              className={`flex items-center gap-3 px-6 py-3 hover:bg-[var(--surface-card-subtle)] no-underline ${
                pathname === "/"
                  ? "font-bold text-[var(--interactive-primary)]"
                  : "text-[var(--text-primary)]"
              }`}
            >
              <span className="text-lg">🏠</span>
              <Ruby reading="とっぷ">トップ</Ruby>
            </Link>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(
                item.href.replace(/\/\d{4}$/, ""),
              );
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 hover:bg-[var(--surface-card-subtle)] no-underline ${
                    isActive
                      ? "font-bold text-[var(--interactive-primary)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <Ruby reading={item.titleReading}>{item.title}</Ruby>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
