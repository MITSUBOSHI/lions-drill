"use client";

import * as React from "react";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (details: { checked: boolean }) => void;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, ref) {
    const { checked = false, onCheckedChange, children, size = "md" } = props;

    const sizeClasses = {
      sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
      md: { track: "w-10 h-5", thumb: "w-4 h-4", translate: "translate-x-5" },
      lg: { track: "w-12 h-6", thumb: "w-5 h-5", translate: "translate-x-6" },
    };

    const s = sizeClasses[size];

    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.({ checked: e.target.checked })}
        />
        <span
          className={`${s.track} relative inline-flex items-center rounded-full transition-colors ${
            checked ? "bg-[var(--interactive-primary)]" : "bg-gray-300"
          }`}
        >
          <span
            className={`${s.thumb} rounded-full bg-white shadow transform transition-transform ${
              checked ? s.translate : "translate-x-0.5"
            }`}
          />
        </span>
        {children != null && (
          <span className="text-sm text-[var(--text-primary)]">{children}</span>
        )}
      </label>
    );
  },
);
