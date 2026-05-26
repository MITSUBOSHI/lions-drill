"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import OptionGroup from "@/components/common/OptionGroup";
import Ruby from "@/components/common/Ruby";
import type { Mode, Operator, ModeRoleType } from "@/lib/drill";

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export default function DrillSettings({ mode, onModeChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOperatorChange = (operator: Operator) => {
    const currentOperators = mode.operators;
    const newOperators = currentOperators.includes(operator)
      ? currentOperators.filter((op) => op !== operator)
      : [...currentOperators, operator];

    const operators =
      newOperators.length > 0 ? newOperators : (["+"] as Operator[]);
    onModeChange({ ...mode, operators });
  };

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
        <Ruby reading="せってい">設定</Ruby>
        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
      </button>
      {isOpen && (
        <div className="flex flex-col gap-4 items-stretch px-6 pb-6">
          <div>
            <p className="font-bold mb-2">
              <Ruby reading="たいしょうせんしゅ">対象選手</Ruby>
            </p>
            <OptionGroup
              name="role"
              options={[
                {
                  value: "roster",
                  label: (
                    <>
                      <Ruby reading="しはいか">支配下</Ruby>
                      <Ruby reading="せんしゅ">選手</Ruby>のみ
                    </>
                  ),
                },
                { value: "all", label: "すべて" },
              ]}
              selectedValues={[mode.role]}
              onChange={(value) => {
                onModeChange({
                  ...mode,
                  role: value as ModeRoleType,
                });
              }}
            />
          </div>
          <div>
            <p className="font-bold mb-2">
              <Ruby reading="なんいど">難易度</Ruby>
            </p>
            <OptionGroup
              name="playerNum"
              options={[
                { value: "2", label: "Easy" },
                { value: "3", label: "Normal" },
                { value: "4", label: "Hard" },
              ]}
              selectedValues={[String(mode.playerNum)]}
              onChange={(value) => {
                onModeChange({
                  ...mode,
                  playerNum: Number(value) as 2 | 3 | 4,
                });
              }}
            />
          </div>
          <div>
            <p className="font-bold mb-2">
              <Ruby reading="しようする">使用する</Ruby>
              <Ruby reading="えんざんし">演算子</Ruby>
            </p>
            <OptionGroup
              name="operators"
              options={[
                {
                  value: "+",
                  label: (
                    <>
                      <Ruby reading="た">足</Ruby>し
                      <Ruby reading="ざん">算</Ruby>（＋）
                    </>
                  ),
                },
                {
                  value: "-",
                  label: (
                    <>
                      <Ruby reading="ひ">引</Ruby>き
                      <Ruby reading="ざん">算</Ruby>（－）
                    </>
                  ),
                },
                {
                  value: "*",
                  label: (
                    <>
                      <Ruby reading="か">掛</Ruby>け
                      <Ruby reading="ざん">算</Ruby>（×）
                    </>
                  ),
                },
                {
                  value: "/",
                  label: (
                    <>
                      <Ruby reading="わ">割</Ruby>り
                      <Ruby reading="ざん">算</Ruby>（÷）
                    </>
                  ),
                },
              ]}
              selectedValues={mode.operators}
              onChange={(value) => handleOperatorChange(value as Operator)}
              multiple
            />
          </div>
        </div>
      )}
    </div>
  );
}
