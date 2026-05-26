import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LineupCustomCreator from "./LineupCustomCreator";

const mockSearchParams = { current: new URLSearchParams() };

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams.current,
}));

jest.mock("react-icons/fi", () => ({
  FiChevronDown: () => <span>down</span>,
  FiChevronRight: () => <span>right</span>,
  FiDownload: () => <span>download</span>,
  FiLink: () => <span>link</span>,
  FiCheck: () => <span>check</span>,
  FiShare2: () => <span>share</span>,
}));

jest.mock("react-icons/fa6", () => ({
  FaXTwitter: () => <span>twitter</span>,
}));

jest.mock("@next/third-parties/google", () => ({
  sendGAEvent: jest.fn(),
}));

describe("LineupCustomCreator", () => {
  beforeEach(() => {
    mockSearchParams.current = new URLSearchParams();
  });

  it("9枠の打順入力欄が表示される", () => {
    render(<LineupCustomCreator />);
    expect(screen.getByText("打順入力")).toBeInTheDocument();
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByText(`${i}番`)).toBeInTheDocument();
    }
  });

  it("デフォルトでは選手名ラベルが表示される", () => {
    render(<LineupCustomCreator />);
    const labels = screen.getAllByText(/選手名（30字以内）/);
    expect(labels).toHaveLength(9);
  });

  it("デフォルトではメモ欄が表示されない", () => {
    render(<LineupCustomCreator />);
    expect(screen.queryByText(/メモ・理由（任意/)).not.toBeInTheDocument();
  });

  it("名前入力で文字数カウントが更新される", () => {
    render(<LineupCustomCreator />);
    const inputs = screen.getAllByPlaceholderText("選手名を入力");
    fireEvent.change(inputs[0], { target: { value: "佐野" } });
    expect((inputs[0] as HTMLInputElement).value).toBe("佐野");
    expect(screen.getByText("2/30")).toBeInTheDocument();
  });

  it("30字を超える入力は切り詰められる", () => {
    render(<LineupCustomCreator />);
    const inputs = screen.getAllByPlaceholderText("選手名を入力");
    const longText = "あ".repeat(40);
    fireEvent.change(inputs[0], { target: { value: longText } });
    expect((inputs[0] as HTMLInputElement).value).toHaveLength(30);
  });

  it("設定パネルを開いて項目ラベルを変更すると入力ラベルが切り替わる", () => {
    render(<LineupCustomCreator />);
    fireEvent.click(screen.getByText("設定"));
    const labelInput = screen.getByPlaceholderText(
      "例: 選手名 / ニュース / 商品名",
    );
    fireEvent.change(labelInput, { target: { value: "ニュース" } });
    expect(screen.getAllByText(/ニュース（30字以内）/)).toHaveLength(9);
    expect(screen.getAllByPlaceholderText("ニュースを入力")).toHaveLength(9);
  });

  it("メモ・理由スイッチをONにするとメモ欄が現れる", () => {
    render(<LineupCustomCreator />);
    fireEvent.click(screen.getByText("設定"));
    const memoSwitch = screen.getByLabelText("メモ・理由を入力する");
    fireEvent.click(memoSwitch);
    expect(screen.getAllByPlaceholderText("メモや起用理由など")).toHaveLength(
      9,
    );
  });

  it("URLパラメータからメモが復元される時はメモ欄が自動で開く", () => {
    const params = new URLSearchParams();
    params.set("n1", "佐野");
    params.set("m1", "主将");
    mockSearchParams.current = params;

    render(<LineupCustomCreator />);
    expect(screen.getAllByPlaceholderText("メモや起用理由など")).toHaveLength(
      9,
    );
    const memoTextarea = screen.getAllByPlaceholderText(
      "メモや起用理由など",
    )[0] as HTMLTextAreaElement;
    expect(memoTextarea.value).toBe("主将");
  });

  it("URLパラメータの itemLabel が入力欄ラベルに反映される", () => {
    const params = new URLSearchParams();
    params.set("label", "商品名");
    mockSearchParams.current = params;

    render(<LineupCustomCreator />);
    expect(screen.getAllByText(/商品名（30字以内）/)).toHaveLength(9);
  });

  it("リセットで入力値が初期化される", () => {
    render(<LineupCustomCreator />);
    const inputs = screen.getAllByPlaceholderText("選手名を入力");
    fireEvent.change(inputs[0], { target: { value: "佐野" } });
    fireEvent.click(screen.getByText("リセット"));
    expect(
      (screen.getAllByPlaceholderText("選手名を入力")[0] as HTMLInputElement)
        .value,
    ).toBe("");
  });
});
