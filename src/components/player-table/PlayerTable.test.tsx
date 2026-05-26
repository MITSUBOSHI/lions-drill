import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlayerTable from "./PlayerTable";
import { PlayerType, Role } from "@/types/Player";

jest.mock("@/contexts/FuriganaContext", () => ({
  useFurigana: () => ({ furigana: false, setFurigana: () => {} }),
}));

jest.mock("@/components/common/Ruby", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode; reading: string }) => (
    <>{children}</>
  ),
}));

jest.mock("react-icons/fa", () => ({
  FaSort: () => <span>sort</span>,
  FaSortUp: () => <span>sort-up</span>,
  FaSortDown: () => <span>sort-down</span>,
}));

jest.mock("react-icons/fi", () => ({
  FiMusic: () => <span>music</span>,
}));

jest.mock("react-icons/gi", () => ({
  GiClothes: () => <span>clothes</span>,
}));

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

const mockPlayers: PlayerType[] = [
  {
    name: "佐野 恵太",
    name_kana: "さの けいた",
    uniform_name: "SANO",
    number_disp: "7",
    number_calc: 7,
    role: Role.Roster,
    year: 2026,
    url: "https://dummy/sano",
    date_of_birth: "1994-11-28",
    height_cm: 178,
    weight_kg: 88,
  },
  {
    name: "牧 秀悟",
    name_kana: "まき しゅうご",
    uniform_name: "MAKI",
    number_disp: "2",
    number_calc: 2,
    role: Role.Roster,
    year: 2026,
    url: "https://dummy/maki",
    date_of_birth: "1998-04-21",
    height_cm: 178,
    weight_kg: 97,
  },
  {
    name: "山本 祐大",
    name_kana: "やまもと ゆうだい",
    uniform_name: "YAMAMOTO",
    number_disp: "50",
    number_calc: 50,
    role: Role.Roster,
    year: 2026,
    url: "https://dummy/yamamoto",
    date_of_birth: "1998-09-11",
    height_cm: 180,
    weight_kg: 87,
  },
];

const COLS = 6; // 背番号, 名前, 生年月日, 身長, 体重, リンク

describe("PlayerTable", () => {
  it("renders all players correctly", () => {
    render(<PlayerTable players={mockPlayers} year={2026} />);

    // Check if all players are rendered
    mockPlayers.forEach((player) => {
      expect(
        screen.getByText((content) => content.includes(player.name)),
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes(player.name_kana)),
      ).toBeInTheDocument();
      expect(screen.getByText(player.number_disp)).toBeInTheDocument();
    });

    // Check if table headers are rendered
    expect(screen.getByText("背番号")).toBeInTheDocument();
    expect(screen.getByText("名前")).toBeInTheDocument();
    expect(screen.getByText("生年月日")).toBeInTheDocument();
    expect(screen.getByText("身長")).toBeInTheDocument();
    expect(screen.getByText("体重")).toBeInTheDocument();
    expect(screen.getByText("リンク")).toBeInTheDocument();
  });

  it("should sort players by number when sort button is clicked", () => {
    render(<PlayerTable players={mockPlayers} year={2026} />);
    const sortButton = screen.getByLabelText("背番号でソート");

    // Initial order check
    const initialCells = screen.getAllByRole("cell");
    expect(initialCells[0 * COLS]).toHaveTextContent("7");
    expect(initialCells[1 * COLS]).toHaveTextContent("2");
    expect(initialCells[2 * COLS]).toHaveTextContent("50");

    // Click sort button for ascending order
    fireEvent.click(sortButton);
    const ascCells = screen.getAllByRole("cell");
    expect(ascCells[0 * COLS]).toHaveTextContent("2");
    expect(ascCells[1 * COLS]).toHaveTextContent("7");
    expect(ascCells[2 * COLS]).toHaveTextContent("50");

    // Click sort button for descending order
    fireEvent.click(sortButton);
    const descCells = screen.getAllByRole("cell");
    expect(descCells[0 * COLS]).toHaveTextContent("50");
    expect(descCells[1 * COLS]).toHaveTextContent("7");
    expect(descCells[2 * COLS]).toHaveTextContent("2");
  });

  it("should sort players by date_of_birth when sort button is clicked", () => {
    render(<PlayerTable players={mockPlayers} year={2026} />);
    const sortButton = screen.getByLabelText("生年月日でソート");

    // Initial order check
    const initialCells = screen.getAllByRole("cell");
    expect(initialCells[0 * COLS + 2]).toHaveTextContent("1994-11-28");
    expect(initialCells[1 * COLS + 2]).toHaveTextContent("1998-04-21");
    expect(initialCells[2 * COLS + 2]).toHaveTextContent("1998-09-11");

    // Click sort button for ascending order
    fireEvent.click(sortButton);
    const ascCells = screen.getAllByRole("cell");
    expect(ascCells[0 * COLS + 2]).toHaveTextContent("1994-11-28");
    expect(ascCells[1 * COLS + 2]).toHaveTextContent("1998-04-21");
    expect(ascCells[2 * COLS + 2]).toHaveTextContent("1998-09-11");

    // Click sort button for descending order
    fireEvent.click(sortButton);
    const descCells = screen.getAllByRole("cell");
    expect(descCells[0 * COLS + 2]).toHaveTextContent("1998-09-11");
    expect(descCells[1 * COLS + 2]).toHaveTextContent("1998-04-21");
    expect(descCells[2 * COLS + 2]).toHaveTextContent("1994-11-28");
  });

  it("should sort players by height_cm when sort button is clicked", () => {
    render(<PlayerTable players={mockPlayers} year={2026} />);
    const sortButton = screen.getByLabelText("身長でソート");

    // Initial order check
    const initialCells = screen.getAllByRole("cell");
    expect(initialCells[0 * COLS + 3]).toHaveTextContent("178cm");
    expect(initialCells[1 * COLS + 3]).toHaveTextContent("178cm");
    expect(initialCells[2 * COLS + 3]).toHaveTextContent("180cm");

    // Click sort button for ascending order
    fireEvent.click(sortButton);
    const ascCells = screen.getAllByRole("cell");
    expect(ascCells[0 * COLS + 3]).toHaveTextContent("178cm");
    expect(ascCells[1 * COLS + 3]).toHaveTextContent("178cm");
    expect(ascCells[2 * COLS + 3]).toHaveTextContent("180cm");

    // Click sort button for descending order
    fireEvent.click(sortButton);
    const descCells = screen.getAllByRole("cell");
    expect(descCells[0 * COLS + 3]).toHaveTextContent("180cm");
    expect(descCells[1 * COLS + 3]).toHaveTextContent("178cm");
    expect(descCells[2 * COLS + 3]).toHaveTextContent("178cm");
  });

  it("should sort players by weight_kg when sort button is clicked", () => {
    render(<PlayerTable players={mockPlayers} year={2026} />);
    const sortButton = screen.getByLabelText("体重でソート");

    // Initial order check
    const initialCells = screen.getAllByRole("cell");
    expect(initialCells[0 * COLS + 4]).toHaveTextContent("88kg");
    expect(initialCells[1 * COLS + 4]).toHaveTextContent("97kg");
    expect(initialCells[2 * COLS + 4]).toHaveTextContent("87kg");

    // Click sort button for ascending order
    fireEvent.click(sortButton);
    const ascCells = screen.getAllByRole("cell");
    expect(ascCells[0 * COLS + 4]).toHaveTextContent("87kg");
    expect(ascCells[1 * COLS + 4]).toHaveTextContent("88kg");
    expect(ascCells[2 * COLS + 4]).toHaveTextContent("97kg");

    // Click sort button for descending order
    fireEvent.click(sortButton);
    const descCells = screen.getAllByRole("cell");
    expect(descCells[0 * COLS + 4]).toHaveTextContent("97kg");
    expect(descCells[1 * COLS + 4]).toHaveTextContent("88kg");
    expect(descCells[2 * COLS + 4]).toHaveTextContent("87kg");
  });

  it("should render player links correctly", () => {
    render(<PlayerTable players={mockPlayers} year={2026} />);

    mockPlayers.forEach((player) => {
      const link = screen
        .getByText((content) => content.includes(player.name))
        .closest("a");
      expect(link).toHaveAttribute("href", player.url);
    });
  });
});
