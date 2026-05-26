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
      <div ref={ref} className="flex w-full">
        <div className="relative flex-1">{enhancedChildren}</div>
        <div className="flex flex-col border border-l-0 border-[var(--border-card)] rounded-r-md">
          <button
            type="button"
            onClick={handleIncrement}
            className="px-2 py-0.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-brand)] border-b border-[var(--border-card)]"
            aria-label="increment"
            tabIndex={-1}
          >
            +
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="px-2 py-0.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-brand)]"
            aria-label="decrement"
            tabIndex={-1}
          >
            -
          </button>
        </div>
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
      className={`w-full px-3 py-2 border border-[var(--border-card)] rounded-l-md bg-[var(--surface-card-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] ${className ?? ""}`}
      {...rest}
    />
  );
});
