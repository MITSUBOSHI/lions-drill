"use client";

import { forwardRef } from "react";
import * as React from "react";

export interface NumberInputRootProps {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  width?: string;
  min?: number;
  max?: number;
  value?: string;
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void;
}

export const NumberInputRoot = forwardRef<HTMLDivElement, NumberInputRootProps>(
  function NumberInputRoot(props, ref) {
    const { children, value, min, max, onValueChange } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const num = parseFloat(newValue);
      onValueChange?.({
        value: newValue,
        valueAsNumber: isNaN(num) ? 0 : num,
      });
    };

    const handleIncrement = () => {
      const num = parseFloat(value ?? "0") || 0;
      const newVal = max !== undefined ? Math.min(num + 1, max) : num + 1;
      onValueChange?.({ value: String(newVal), valueAsNumber: newVal });
    };

    const handleDecrement = () => {
      const num = parseFloat(value ?? "0") || 0;
      const newVal = min !== undefined ? Math.max(num - 1, min) : num - 1;
      onValueChange?.({ value: String(newVal), valueAsNumber: newVal });
    };

    // Clone children to inject props
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === NumberInputField) {
        return React.cloneElement(
          child as React.ReactElement<NumberInputFieldProps>,
          {
            value,
            onChange: handleChange,
            min,
            max,
          },
        );
      }
      return child;
    });

    return (
      <div ref={ref} className="flex w-full items-stretch">
        <button
          type="button"
          onClick={handleDecrement}
          className="min-w-11 min-h-11 px-3 text-xl font-bold text-[var(--interactive-primary)] bg-[var(--surface-card-subtle)] hover:bg-[var(--surface-brand)] border border-r-0 border-[var(--border-card)] rounded-l-md cursor-pointer"
          aria-label="1減らす"
          tabIndex={-1}
        >
          −
        </button>
        <div className="relative flex-1">{enhancedChildren}</div>
        <button
          type="button"
          onClick={handleIncrement}
          className="min-w-11 min-h-11 px-3 text-xl font-bold text-[var(--interactive-primary)] bg-[var(--surface-card-subtle)] hover:bg-[var(--surface-brand)] border border-l-0 border-[var(--border-card)] rounded-r-md cursor-pointer"
          aria-label="1増やす"
          tabIndex={-1}
        >
          +
        </button>
      </div>
    );
  },
);

export interface NumberInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  bg?: string;
  "data-testid"?: string;
  _placeholder?: Record<string, string>;
}

export const NumberInputField = forwardRef<
  HTMLInputElement,
  NumberInputFieldProps
>(function NumberInputField(props, ref) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bg, _placeholder, className, ...rest } = props;
  return (
    <input
      ref={ref}
      type="number"
      className={`w-full h-full min-h-11 px-3 py-2 text-lg text-center border border-[var(--border-card)] bg-[var(--surface-card-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] ${className ?? ""}`}
      {...rest}
    />
  );
});
