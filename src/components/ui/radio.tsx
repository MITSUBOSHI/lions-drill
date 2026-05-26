"use client";

import { forwardRef } from "react";
import * as React from "react";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rootRef?: React.Ref<HTMLLabelElement>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  value?: string;
  children?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    const { children, inputProps, rootRef, value, name, ...rest } = props;
    return (
      <label
        ref={rootRef}
        className="inline-flex items-center gap-2 cursor-pointer"
      >
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          className="accent-[var(--interactive-primary)]"
          {...inputProps}
          {...rest}
        />
        {children && (
          <span className="text-sm text-[var(--text-primary)]">{children}</span>
        )}
      </label>
    );
  },
);

export interface RadioGroupProps {
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (details: { value: string }) => void;
  name?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(props, ref) {
    const { children, ...rest } = props;
    return (
      <div ref={ref} role="radiogroup" {...rest}>
        {children}
      </div>
    );
  },
);
