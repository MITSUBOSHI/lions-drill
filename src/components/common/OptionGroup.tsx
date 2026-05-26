"use client";

import type { ReactNode } from "react";

type Option = {
  value: string;
  label: ReactNode;
};

type OptionGroupProps = {
  name: string;
  options: Option[];
  selectedValues: string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  gap?: string;
};

export default function OptionGroup({
  name,
  options,
  selectedValues,
  onChange,
  multiple = false,
}: OptionGroupProps) {
  return (
    <div
      className="flex flex-wrap gap-6"
      role={multiple ? "group" : "radiogroup"}
      aria-label={name}
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <label
            key={option.value}
            className={`p-2 border rounded-md cursor-pointer transition-all duration-150 hover:border-[var(--interactive-primary-hover)] ${
              isSelected
                ? "border-[var(--interactive-primary)] bg-[var(--interactive-primary)] text-white"
                : "border-[var(--border-card)] bg-[var(--surface-card-subtle)] text-[var(--text-primary)]"
            }`}
            role={multiple ? "checkbox" : "radio"}
            aria-checked={isSelected}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              hidden
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
