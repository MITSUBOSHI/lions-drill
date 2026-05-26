import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DrillSettings from "./DrillSettings";
import type { Mode } from "@/lib/drill";
import React from "react";

jest.mock("@/contexts/FuriganaContext", () => ({
  useFurigana: () => ({ furigana: false, setFurigana: () => {} }),
}));

jest.mock("@/components/common/Ruby", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode; reading: string }) => (
    <>{children}</>
  ),
}));

jest.mock("react-icons/fi", () => ({
  FiChevronDown: () => <span>down</span>,
  FiChevronRight: () => <span>right</span>,
}));

const defaultMode: Mode = {
  role: "roster",
  playerNum: 2,
  operators: ["+"],
};

describe("DrillSettings", () => {
  const openSettings = () => {
    fireEvent.click(screen.getByText("設定"));
  };

  it("設定ラベルが表示される", () => {
    render(<DrillSettings mode={defaultMode} onModeChange={() => {}} />);
    expect(screen.getByText("設定")).toBeInTheDocument();
    openSettings();
    expect(screen.getByText("対象選手")).toBeInTheDocument();
    expect(screen.getByText("難易度")).toBeInTheDocument();
  });

  it("対象選手の選択肢が表示される", () => {
    render(<DrillSettings mode={defaultMode} onModeChange={() => {}} />);
    openSettings();
    expect(screen.getByText("支配下選手のみ")).toBeInTheDocument();
    expect(screen.getByText("すべて")).toBeInTheDocument();
  });

  it("難易度の選択肢が表示される", () => {
    render(<DrillSettings mode={defaultMode} onModeChange={() => {}} />);
    openSettings();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("演算子の選択肢が表示される", () => {
    render(<DrillSettings mode={defaultMode} onModeChange={() => {}} />);
    openSettings();
    expect(screen.getByText(/足し算/)).toBeInTheDocument();
    expect(screen.getByText(/引き算/)).toBeInTheDocument();
    expect(screen.getByText(/掛け算/)).toBeInTheDocument();
    expect(screen.getByText(/割り算/)).toBeInTheDocument();
  });

  it("演算子のトグルで onModeChange が呼ばれる", () => {
    const onModeChange = jest.fn();
    render(<DrillSettings mode={defaultMode} onModeChange={onModeChange} />);
    openSettings();

    // 引き算の checkbox input をクリック
    const checkboxes = screen.getAllByRole("checkbox", { hidden: true });
    const subCheckbox = checkboxes.find(
      (el) => (el as HTMLInputElement).value === "-",
    )!;
    fireEvent.click(subCheckbox);
    expect(onModeChange).toHaveBeenCalledWith({
      ...defaultMode,
      operators: ["+", "-"],
    });
  });

  it("最後の演算子を外そうとすると + にフォールバックする", () => {
    const onModeChange = jest.fn();
    render(<DrillSettings mode={defaultMode} onModeChange={onModeChange} />);
    openSettings();

    // 足し算（唯一の演算子）の checkbox input をクリック
    const checkboxes = screen.getAllByRole("checkbox", { hidden: true });
    const addCheckbox = checkboxes.find(
      (el) => (el as HTMLInputElement).value === "+",
    )!;
    fireEvent.click(addCheckbox);
    expect(onModeChange).toHaveBeenCalledWith({
      ...defaultMode,
      operators: ["+"],
    });
  });
});
