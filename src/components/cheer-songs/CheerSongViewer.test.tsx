import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearchParams } from "next/navigation";
import CheerSongViewer from "./CheerSongViewer";
import { CheerSongType } from "@/types/CheerSong";
import React from "react";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => new URLSearchParams("")),
}));

jest.mock("@/contexts/FuriganaContext", () => ({
  useFurigana: () => ({ furigana: false, setFurigana: () => {} }),
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

jest.mock("@next/third-parties/google", () => ({
  sendGAEvent: jest.fn(),
}));

jest.mock("react-icons/fi", () => ({
  FiSearch: () => <span>search</span>,
  FiBook: () => <span>book</span>,
  FiMusic: () => <span>music</span>,
}));

jest.mock("react-icons/gi", () => ({
  GiClothes: () => <span>clothes</span>,
}));

const makeSong = (
  overrides: Partial<CheerSongType> & { id: string; title: string },
): CheerSongType => ({
  category: "individual_batter",
  lyrics: ["テスト歌詞"],
  isCommon: false,
  ...overrides,
});

const mockSongs: CheerSongType[] = [
  makeSong({
    id: "pitcher-1",
    title: "右投手の歌",
    category: "right_pitcher",
    playerNumber: "11",
  }),
  makeSong({
    id: "batter-1",
    title: "牧 秀悟",
    category: "individual_batter",
    playerNumber: "2",
  }),
  makeSong({
    id: "manager-1",
    title: "監督の歌",
    category: "manager",
  }),
];

describe("CheerSongViewer", () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(""));
  });

  it("デフォルトで投手共通タブが選択される", () => {
    render(<CheerSongViewer songs={mockSongs} year={2026} />);
    expect(screen.getByText("右投手の歌")).toBeInTheDocument();
    expect(screen.queryByText("牧 秀悟")).not.toBeInTheDocument();
  });

  it("タブを切り替えると対応する曲が表示される", () => {
    render(<CheerSongViewer songs={mockSongs} year={2026} />);

    fireEvent.click(screen.getByText("野手個人"));
    expect(screen.getByText("牧 秀悟")).toBeInTheDocument();
    expect(screen.queryByText("右投手の歌")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("監督"));
    expect(screen.getByText("監督の歌")).toBeInTheDocument();
  });

  it("タブに role=tab と aria-selected が設定される", () => {
    render(<CheerSongViewer songs={mockSongs} year={2026} />);

    const pitcherTab = screen.getByRole("tab", { name: "投手共通" });
    expect(pitcherTab).toHaveAttribute("aria-selected", "true");

    const batterTab = screen.getByRole("tab", { name: "野手個人" });
    expect(batterTab).toHaveAttribute("aria-selected", "false");
  });

  it("?number パラメータで該当タブに自動切替される", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("number=2"),
    );

    render(<CheerSongViewer songs={mockSongs} year={2026} />);
    // 背番号2 = 牧 秀悟 (individual_batter) → 野手個人タブ
    expect(screen.getByText("牧 秀悟")).toBeInTheDocument();
  });

  it("tabpanel に適切な role と aria-labelledby が設定される", () => {
    render(<CheerSongViewer songs={mockSongs} year={2026} />);
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", "tab-pitcher");
  });
});
