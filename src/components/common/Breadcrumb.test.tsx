import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AppBreadcrumb from "./Breadcrumb";
import { TEAM } from "@/config/team";
import React from "react";

let mockPathname = "/number-drill/2026";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("@/contexts/FuriganaContext", () => ({
  useFurigana: () => ({ furigana: false, setFurigana: () => {} }),
}));

jest.mock("@/components/common/Ruby", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode; reading: string }) => (
    <>{children}</>
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("react-icons/fi", () => ({
  FiMenu: () => <span data-testid="menu-icon">menu</span>,
  FiX: () => <span data-testid="close-icon">close</span>,
  FiChevronDown: () => <span>down</span>,
  FiChevronRight: () => <span>right</span>,
}));

describe("AppBreadcrumb", () => {
  beforeEach(() => {
    mockPathname = "/number-drill/2026";
  });

  it("パンくずリストが表示される", () => {
    render(<AppBreadcrumb />);
    expect(screen.getByText("トップ")).toBeInTheDocument();
    expect(screen.getByText("背番号計算ドリル")).toBeInTheDocument();
    expect(screen.getByText("2026年")).toBeInTheDocument();
  });

  it("トップページではパンくずリストが表示されない", () => {
    mockPathname = "/";
    render(<AppBreadcrumb />);
    expect(screen.queryByText(">")).not.toBeInTheDocument();
  });

  it("ふりがなボタンが表示される", () => {
    render(<AppBreadcrumb />);
    expect(screen.getByText(/ふりがな/)).toBeInTheDocument();
  });

  it("ハンバーガーメニューボタンが表示される", () => {
    render(<AppBreadcrumb />);
    expect(
      screen.getByRole("button", { name: "メニューを開く" }),
    ).toBeInTheDocument();
  });

  it("メニューを開くとナビゲーションリンクが表示される", () => {
    render(<AppBreadcrumb />);
    const menuButton = screen.getByRole("button", { name: "メニューを開く" });
    fireEvent.click(menuButton);

    expect(screen.getByText("選手名鑑")).toBeInTheDocument();
    expect(screen.getByText("背番号タイマー")).toBeInTheDocument();
    expect(screen.getByText("スタメン作成")).toBeInTheDocument();
    expect(screen.getByText("ユニフォームビュー")).toBeInTheDocument();
    if (TEAM.features.cheerSongs) {
      expect(screen.getByText("応援歌")).toBeInTheDocument();
    } else {
      expect(screen.queryByText("応援歌")).not.toBeInTheDocument();
    }
  });

  it("メニューを閉じるとナビゲーションリンクが非表示になる", () => {
    render(<AppBreadcrumb />);
    const menuButton = screen.getByRole("button", { name: "メニューを開く" });
    const probeLabel = TEAM.features.cheerSongs ? "応援歌" : "選手名鑑";

    fireEvent.click(menuButton);
    expect(screen.getByText(probeLabel)).toBeInTheDocument();

    fireEvent.click(menuButton);
    // メニュー閉じた後はモバイルメニュー（クリック対象）のリンクが消える。
    // パンくずに含まれない選手名鑑などはメニュー閉鎖後に検出されない。
    const remaining = screen.queryAllByText(probeLabel);
    expect(remaining.length).toBeLessThanOrEqual(0);
  });
});
