import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearchParams } from "next/navigation";
import UniformViewer from "./UniformViewer";
import { PlayerType, Role } from "@/types/Player";
import { ReactNode } from "react";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => new URLSearchParams("")),
}));

jest.mock("@/contexts/FuriganaContext", () => ({
  useFurigana: () => ({ furigana: false, setFurigana: () => {} }),
}));

jest.mock("@/components/common/Ruby", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode; reading: string }) => (
    <>{children}</>
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("./UniformBack", () => ({
  __esModule: true,
  default: ({
    uniformName,
    numberDisp,
  }: {
    uniformName: string;
    numberDisp: string;
  }) => (
    <div data-testid="uniform-back">
      {uniformName} #{numberDisp}
    </div>
  ),
}));

jest.mock("react-icons/fi", () => ({
  FiChevronLeft: () => <span>left</span>,
  FiChevronRight: () => <span>right</span>,
  FiLink: () => <span data-testid="icon-link">link</span>,
  FiCheck: () => <span data-testid="icon-check">check</span>,
}));

jest.mock("@next/third-parties/google", () => ({
  sendGAEvent: jest.fn(),
}));

const mockPlayers: PlayerType[] = [
  {
    year: 2026,
    name: "牧 秀悟",
    name_kana: "まき しゅうご",
    uniform_name: "MAKI",
    number_calc: 2,
    number_disp: "2",
    role: Role.Roster,
    url: "",
    date_of_birth: "1998-04-21",
    height_cm: 178,
    weight_kg: 97,
  },
  {
    year: 2026,
    name: "東 克樹",
    name_kana: "あずま かつき",
    uniform_name: "AZUMA",
    number_calc: 11,
    number_disp: "11",
    role: Role.Roster,
    url: "",
    date_of_birth: "1995-11-29",
    height_cm: 170,
    weight_kg: 80,
  },
  {
    year: 2026,
    name: "三浦 大輔",
    name_kana: "みうら だいすけ",
    uniform_name: "MIURA",
    number_calc: 81,
    number_disp: "81",
    role: Role.Coach,
    url: "",
    date_of_birth: "1973-12-25",
    height_cm: null,
    weight_kg: null,
  },
];

describe("UniformViewer", () => {
  it("renders first player sorted by number", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    expect(screen.getByText("牧 秀悟")).toBeInTheDocument();
    expect(screen.getByTestId("uniform-back")).toHaveTextContent("MAKI #2");
  });

  it("shows all players by default including coaches", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("filters to roster only when switch is toggled", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("navigates to next player on right arrow click", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    const nextButton = screen.getByLabelText("次の選手");
    fireEvent.click(nextButton);
    expect(screen.getByText("東 克樹")).toBeInTheDocument();
    expect(screen.getByTestId("uniform-back")).toHaveTextContent("AZUMA #11");
  });

  it("navigates to previous player on left arrow click", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    const prevButton = screen.getByLabelText("前の選手");
    fireEvent.click(prevButton);
    expect(screen.getByText("三浦 大輔")).toBeInTheDocument();
  });

  it("wraps around at the end of the list", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    const nextButton = screen.getByLabelText("次の選手");
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(screen.getByText("牧 秀悟")).toBeInTheDocument();
  });

  it("shows empty message when no players", () => {
    render(<UniformViewer players={[]} year={2026} />);
    expect(screen.getByText("選手データがありません")).toBeInTheDocument();
  });

  it("displays searchable number input with current value and kana", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    const input = screen.getByLabelText("背番号を選択") as HTMLInputElement;
    expect(input.value).toBe("2");
    expect(input.getAttribute("list")).toBe("player-numbers");
    expect(screen.getByText("/ まき しゅうご")).toBeInTheDocument();
  });

  it("jumps to player when number is typed into searchable input", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    const input = screen.getByLabelText("背番号を選択");
    fireEvent.change(input, { target: { value: "81" } });
    expect(screen.getByText("三浦 大輔")).toBeInTheDocument();
    expect(screen.getByTestId("uniform-back")).toHaveTextContent("MIURA #81");
  });

  it("shows player matching ?number query param on mount", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("number=81"),
    );
    render(<UniformViewer players={mockPlayers} year={2026} />);
    expect(screen.getByText("三浦 大輔")).toBeInTheDocument();
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(""));
  });

  it("renders copy link button", () => {
    render(<UniformViewer players={mockPlayers} year={2026} />);
    expect(screen.getByLabelText("URLをコピー")).toBeInTheDocument();
    expect(screen.getByTestId("icon-link")).toBeInTheDocument();
  });

  it("copies URL with number param when link button is clicked", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<UniformViewer players={mockPlayers} year={2026} />);
    fireEvent.click(screen.getByLabelText("URLをコピー"));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("?number=2"),
      );
    });
    expect(screen.getByTestId("icon-check")).toBeInTheDocument();
  });
});
