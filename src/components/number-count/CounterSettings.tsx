"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import OptionGroup from "@/components/common/OptionGroup";
import type { CountDirection } from "./NumberCounter";

type Props = {
  direction: CountDirection;
  onDirectionChange: (direction: CountDirection) => void;
  intervalMs: number;
  onIntervalMsChange: (ms: number) => void;
  countLimitInput: string;
  onCountLimitSelect: (value: string) => void;
  onCountLimitFocus: () => void;
  onCountLimitBlur: () => void;
  speechEnabled: boolean;
  onSpeechEnabledChange: (enabled: boolean) => void;
  includeZero: boolean;
  onIncludeZeroChange: (includeZero: boolean) => void;
  disabled: boolean;
};

const countLimitPresets = [10, 15, 20, 30, 45, 60, 90, 99];

const speedOptions = [
  { value: "2000", label: "ゆっくり (2秒)" },
  { value: "1000", label: "ふつう (1秒)" },
  { value: "500", label: "はやい (0.5秒)" },
];

export default function CounterSettings({
  direction,
  onDirectionChange,
  intervalMs,
  onIntervalMsChange,
  countLimitInput,
  onCountLimitSelect,
  onCountLimitFocus,
  onCountLimitBlur,
  speechEnabled,
  onSpeechEnabledChange,
  includeZero,
  onIncludeZeroChange,
  disabled,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: "var(--surface-brand)",
        borderColor: "var(--border-brand)",
      }}
    >
      <button
        className="flex items-center justify-between w-full p-4 cursor-pointer font-bold text-base bg-transparent border-none text-[var(--text-primary)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        設定
        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
      </button>
      {isOpen && (
        <div className="flex flex-col gap-4 items-stretch px-6 pb-6">
          <div>
            <p className="font-bold mb-2">カウント数</p>
            <div className="flex items-center gap-2">
              <input
                list="count-limit-options"
                value={countLimitInput}
                onChange={(e) => onCountLimitSelect(e.target.value)}
                onFocus={onCountLimitFocus}
                onClick={onCountLimitFocus}
                onBlur={onCountLimitBlur}
                disabled={disabled}
                aria-label="カウント数"
                className="w-16 text-sm px-2 py-1 border rounded text-center"
                style={{
                  borderColor: "var(--border-card)",
                  backgroundColor: "var(--surface-card-subtle)",
                  color: "var(--text-primary)",
                }}
              />
              <datalist id="count-limit-options">
                {countLimitPresets.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <p className="font-bold mb-2">0を含める</p>
            <OptionGroup
              name="includeZero"
              options={[
                { value: "on", label: "ON" },
                { value: "off", label: "OFF" },
              ]}
              selectedValues={[includeZero ? "on" : "off"]}
              onChange={(value) => onIncludeZeroChange(value === "on")}
              gap="8px"
            />
          </div>

          <div>
            <p className="font-bold mb-2">方向</p>
            <OptionGroup
              name="direction"
              options={[
                { value: "up", label: "カウントアップ" },
                { value: "down", label: "カウントダウン" },
              ]}
              selectedValues={[direction]}
              onChange={(value) => onDirectionChange(value as CountDirection)}
              gap="8px"
            />
          </div>

          <div>
            <p className="font-bold mb-2">速度</p>
            <OptionGroup
              name="speed"
              options={speedOptions}
              selectedValues={[String(intervalMs)]}
              onChange={(value) => onIntervalMsChange(Number(value))}
              gap="8px"
            />
          </div>

          <div>
            <p className="font-bold mb-2">音声</p>
            <OptionGroup
              name="speech"
              options={[
                { value: "on", label: "ON" },
                { value: "off", label: "OFF" },
              ]}
              selectedValues={[speechEnabled ? "on" : "off"]}
              onChange={(value) => onSpeechEnabledChange(value === "on")}
              gap="8px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
