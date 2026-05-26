"use client";

import { registeredYears } from "@/constants/player";
import { sendGAEvent } from "@next/third-parties/google";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";

interface YearSelectorProps {
  currentYear: number;
  baseUrl: string;
  label?: string;
  isInline?: boolean;
  years?: readonly number[];
}

export default function YearSelector({
  currentYear,
  baseUrl,
  label = "年を選択",
  isInline = false,
  years,
}: YearSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sortedYears = useMemo(() => {
    return [...(years ?? registeredYears)].sort((a, b) => b - a);
  }, [years]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleYearChange = useCallback(
    (year: number) => {
      if (year !== currentYear) {
        sendGAEvent("event", "year_change", {
          from_year: currentYear,
          to_year: year,
          page: baseUrl,
        });
        router.push(`${baseUrl}/${year}`);
      }
      setIsOpen(false);
    },
    [currentYear, baseUrl, router],
  );

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
          return;
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < sortedYears.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : sortedYears.length - 1,
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < sortedYears.length) {
            handleYearChange(sortedYears[highlightedIndex]);
          }
          break;
      }
    },
    [isOpen, sortedYears, highlightedIndex, handleYearChange],
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div
      className={`relative ${isInline ? "inline-block align-middle ml-3 max-w-[150px]" : "max-w-[220px]"}`}
      ref={containerRef}
    >
      {!isInline && <p className="text-sm mb-2 font-medium">{label}</p>}

      <button
        className={`w-full flex items-center justify-between bg-[var(--surface-brand)] border border-[var(--border-brand)] rounded-md cursor-pointer hover:bg-[var(--interactive-primary-hover)] hover:text-white transition-colors ${
          isInline ? "h-9 text-lg px-3" : "h-11 text-lg px-4"
        }`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label}: ${currentYear}`}
      >
        <span>{currentYear}</span>
        <span
          className={`ml-2 text-blue-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute w-full max-h-[300px] overflow-y-auto mt-2 bg-[var(--surface-card-subtle)] border border-[var(--border-brand)] rounded-md shadow-md z-10"
          role="listbox"
          ref={listRef}
          aria-label={label}
        >
          {sortedYears.map((year, index) => (
            <div
              key={year}
              role="option"
              aria-selected={year === currentYear}
              className={`cursor-pointer hover:bg-[var(--surface-brand)] ${
                isInline ? "p-2" : "p-3"
              } ${
                index === highlightedIndex || year === currentYear
                  ? "bg-[var(--surface-brand)]"
                  : "bg-[var(--surface-card-subtle)]"
              } ${year === currentYear ? "font-bold" : ""}`}
              onClick={() => handleYearChange(year)}
            >
              <span className={isInline ? "text-sm" : "text-base"}>{year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
