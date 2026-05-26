import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import YearSelector from "./YearSelector";
import { useRouter } from "next/navigation";

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@next/third-parties/google", () => ({
  sendGAEvent: jest.fn(),
}));

// 定数のモック
jest.mock("@/constants/player", () => ({
  registeredYears: [2023, 2024, 2025, 2026],
}));

describe("YearSelector", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("renders correctly in default mode", () => {
    render(
      <YearSelector
        currentYear={2024}
        baseUrl="/test/url"
        label="テスト用ラベル"
      />,
    );

    // ラベルが表示されることを確認
    expect(screen.getByText("テスト用ラベル")).toBeInTheDocument();

    // 現在の年が表示されることを確認
    expect(screen.getByText("2024")).toBeInTheDocument();

    // ドロップダウンボタンが表示されることを確認
    expect(
      screen.getByRole("button", { name: "テスト用ラベル: 2024" }),
    ).toBeInTheDocument();

    // 初期状態ではドロップダウンメニューは非表示
    expect(screen.queryByText("2025")).not.toBeInTheDocument();
  });

  it("renders correctly in inline mode", () => {
    render(
      <YearSelector currentYear={2024} baseUrl="/test/url" isInline={true} />,
    );

    // インラインモードではラベルは非表示
    expect(screen.queryByText("年を選択")).not.toBeInTheDocument();

    // 現在の年が表示されることを確認
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(<YearSelector currentYear={2024} baseUrl="/test/url" />);

    // ボタンをクリックしてドロップダウンを開く
    fireEvent.click(screen.getByRole("button", { name: "年を選択: 2024" }));

    // ドロップダウンが開き、すべての年が表示されることを確認
    const options = screen.getAllByRole("option");

    // 年度が表示されていることを確認
    expect(options.some((item) => item.textContent?.includes("2025"))).toBe(
      true,
    );
    expect(options.some((item) => item.textContent?.includes("2024"))).toBe(
      true,
    );
    expect(options.some((item) => item.textContent?.includes("2023"))).toBe(
      true,
    );
  });

  it("navigates to new year when year is selected", () => {
    render(<YearSelector currentYear={2024} baseUrl="/test/url" />);

    // ボタンをクリックしてドロップダウンを開く
    fireEvent.click(screen.getByRole("button", { name: "年を選択: 2024" }));

    // 2025年を選択
    const options = screen.getAllByRole("option");
    const yearItem2025 = options.find((item) =>
      item.textContent?.includes("2025"),
    );
    expect(yearItem2025).toBeTruthy();
    if (yearItem2025) {
      fireEvent.click(yearItem2025);
    }

    // 正しいURLにナビゲートすることを確認
    expect(mockPush).toHaveBeenCalledWith("/test/url/2025");
  });

  it("does not navigate when current year is selected", () => {
    render(<YearSelector currentYear={2024} baseUrl="/test/url" />);

    // ボタンをクリックしてドロップダウンを開く
    fireEvent.click(screen.getByRole("button", { name: "年を選択: 2024" }));

    // 現在の年（2024）を選択
    const options = screen.getAllByRole("option");
    const yearItem2024 = options.find(
      (item) =>
        item.textContent?.includes("2024") &&
        !item.textContent?.includes("2025") &&
        !item.textContent?.includes("2023"),
    );
    expect(yearItem2024).toBeTruthy();
    if (yearItem2024) {
      fireEvent.click(yearItem2024);
    }

    // 同じ年を選択した場合はナビゲートしないことを確認
    expect(mockPush).not.toHaveBeenCalled();
  });
});
