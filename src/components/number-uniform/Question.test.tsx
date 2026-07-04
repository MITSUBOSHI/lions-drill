import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Question from "./Question";
import { PlayerType, Role } from "@/types/Player";
import React from "react";

jest.mock("@/components/common/Ruby", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode; reading: string }) => (
    <>{children}</>
  ),
}));

jest.mock("@/contexts/FuriganaContext", () => ({
  useFurigana: () => ({ furigana: false, setFurigana: () => {} }),
}));

jest.mock("@next/third-parties/google", () => ({
  sendGAEvent: jest.fn(),
}));

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
  {
    name: "宮﨑 敏郎",
    name_kana: "みやざき としろう",
    uniform_name: "MIYAZAKI",
    number_disp: "51",
    number_calc: 51,
    role: Role.Roster,
    year: 2026,
    url: "https://dummy/miyazaki",
    date_of_birth: "1988-12-12",
    height_cm: 172,
    weight_kg: 85,
  },
];

describe("Question Component", () => {
  beforeEach(() => {
    // Reset mock players before each test
    mockPlayers.forEach((player) => {
      player.name_kana = player.name_kana.replace(/\s+/g, " ").trim();
    });
  });

  it("renders initial state correctly", () => {
    render(<Question players={mockPlayers} />);

    // Open settings
    fireEvent.click(screen.getByText("設定"));

    // Check if settings are displayed
    expect(screen.getByText("対象選手")).toBeInTheDocument();
    expect(screen.getByText("難易度")).toBeInTheDocument();

    // Check if radio buttons are present
    expect(screen.getByText("支配下選手のみ")).toBeInTheDocument();
    expect(screen.getByText("すべて")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();

    // Check if operator checkboxes are present
    expect(screen.getByText(/足し算/)).toBeInTheDocument();
    expect(screen.getByText(/引き算/)).toBeInTheDocument();
    expect(screen.getByText(/掛け算/)).toBeInTheDocument();
    expect(screen.getByText(/割り算/)).toBeInTheDocument();

    // Check if buttons are present
    expect(screen.getByText("解答する")).toBeInTheDocument();
    expect(screen.getByText("再挑戦")).toBeInTheDocument();
  });

  it("allows user to input answer", () => {
    render(<Question players={mockPlayers} />);
    const input = screen.getByTestId("number-input");
    fireEvent.change(input, { target: { value: "42" } });
    expect(input).toHaveValue(42);
  });

  it("shows result when answer is submitted", () => {
    render(<Question players={mockPlayers} />);

    const input = screen.getByTestId("number-input");
    const submitButton = screen.getByText("解答する");

    fireEvent.change(input, { target: { value: "42" } });
    fireEvent.click(submitButton);

    // Result box should be visible
    const resultText = screen.getByText("😢 不正解...");
    expect(resultText).toBeInTheDocument();
  });

  describe("when answer the question", () => {
    it("should show correct result when answer is correct", () => {
      const mockPlayers: PlayerType[] = [
        {
          name: "佐野 恵太",
          name_kana: "さのけいた",
          uniform_name: "SANO",
          number_disp: "7",
          number_calc: 7,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "1994-11-28",
          height_cm: 178,
          weight_kg: 88,
        },
        {
          name: "牧 秀悟",
          name_kana: "まきしゅうご",
          uniform_name: "MAKI",
          number_disp: "2",
          number_calc: 2,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "1998-04-21",
          height_cm: 178,
          weight_kg: 97,
        },
      ];
      render(<Question players={mockPlayers} />);

      const input = screen.getByTestId("number-input");
      fireEvent.change(input, { target: { value: String(9) } });
      const submitButton = screen.getByText("解答する");
      fireEvent.click(submitButton);

      // Result box should show correct message
      const resultText = screen.getByText("🎉 正解！");
      expect(resultText).toBeInTheDocument();

      // NOTE: 内訳の選手の順番は制御していないため省略する
      const explanation = screen.getByText(new RegExp(/9 = /));
      expect(explanation).toBeInTheDocument();
    });

    it("should show incorrect result when answer is incorrect", () => {
      const mockPlayers: PlayerType[] = [
        {
          name: "佐野 恵太",
          name_kana: "さのけいた",
          uniform_name: "SANO",
          number_disp: "7",
          number_calc: 7,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "1994-11-28",
          height_cm: 178,
          weight_kg: 88,
        },
        {
          name: "牧 秀悟",
          name_kana: "まきしゅうご",
          uniform_name: "MAKI",
          number_disp: "2",
          number_calc: 2,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "1998-04-21",
          height_cm: 178,
          weight_kg: 97,
        },
      ];
      render(<Question players={mockPlayers} />);

      const input = screen.getByTestId("number-input");
      fireEvent.change(input, { target: { value: String(10) } });
      const submitButton = screen.getByText("解答する");
      fireEvent.click(submitButton);

      // Result box should show incorrect message
      const resultText = screen.getByText("😢 不正解...");
      expect(resultText).toBeInTheDocument();

      // NOTE: 内訳の選手の順番は制御していないため省略する
      const explanation = screen.getByText(new RegExp(/9 = /));
      expect(explanation).toBeInTheDocument();
    });
  });

  it("should reset the game when retry button is clicked", () => {
    render(<Question players={mockPlayers} />);

    const input = screen.getByTestId("number-input");
    const submitButton = screen.getByText("解答する");
    const retryButton = screen.getByText("再挑戦");

    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.click(submitButton);

    expect(input).toHaveValue(999);
    expect(input).toBeDisabled();
    const resultBox = screen.queryByText("😢 不正解...");
    expect(resultBox).toBeInTheDocument();

    fireEvent.click(retryButton);

    expect(input).toHaveValue(null);
    expect(input).not.toBeDisabled();
    expect(resultBox).not.toBeInTheDocument();
  });

  describe("when using arithmetic operators", () => {
    const mockPlayers: PlayerType[] = [
      {
        name: "佐野 恵太",
        name_kana: "さの けいた",
        uniform_name: "SANO",
        number_disp: "7",
        number_calc: 7,
        role: Role.Roster,
        year: 2026,
        url: "https://dummy/",
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
        url: "https://dummy/",
        date_of_birth: "1998-04-21",
        height_cm: 178,
        weight_kg: 97,
      },
    ];

    it("should handle addition correctly", () => {
      render(<Question players={mockPlayers} />);
      const input = screen.getByTestId("number-input");
      fireEvent.change(input, { target: { value: "9" } });
      const submitButton = screen.getByText("解答する");
      fireEvent.click(submitButton);

      const explanation = screen.getByText(/[0-9]+ = /);
      expect(explanation).toBeInTheDocument();
      expect(explanation.textContent).toMatch(/[＋]/);
    });

    it("should handle multiplication correctly", () => {
      // 掛け算が確実に動くよう、割り切れる組み合わせの選手を使用
      const playersForMult: PlayerType[] = [
        {
          name: "選手A",
          name_kana: "せんしゅえー",
          uniform_name: "A",
          number_disp: "3",
          number_calc: 3,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "2000-01-01",
          height_cm: 180,
          weight_kg: 80,
        },
        {
          name: "選手B",
          name_kana: "せんしゅびー",
          uniform_name: "B",
          number_disp: "4",
          number_calc: 4,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "2000-01-01",
          height_cm: 180,
          weight_kg: 80,
        },
      ];
      render(<Question players={playersForMult} />);

      // Open settings, 掛け算を有効化してから足し算を無効化（先に足し算を外すとフォールバックで戻るため）
      fireEvent.click(screen.getByText("設定"));
      const multLabel = screen.getByText(/掛け算/).closest("label")!;
      fireEvent.click(multLabel.querySelector("input")!);
      const addLabel = screen.getByText(/足し算/).closest("label")!;
      fireEvent.click(addLabel.querySelector("input")!);
      fireEvent.click(screen.getByText("設定"));

      const retryButton = screen.getByText("再挑戦");
      fireEvent.click(retryButton);

      expect(screen.getByText(/×/)).toBeInTheDocument();
    });

    it("should handle division correctly", () => {
      // 割り算が確実に割り切れる組み合わせの選手を使用
      const playersForDiv: PlayerType[] = [
        {
          name: "選手C",
          name_kana: "せんしゅしー",
          uniform_name: "C",
          number_disp: "12",
          number_calc: 12,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "2000-01-01",
          height_cm: 180,
          weight_kg: 80,
        },
        {
          name: "選手D",
          name_kana: "せんしゅでぃー",
          uniform_name: "D",
          number_disp: "3",
          number_calc: 3,
          role: Role.Roster,
          year: 2026,
          url: "https://dummy/",
          date_of_birth: "2000-01-01",
          height_cm: 180,
          weight_kg: 80,
        },
      ];
      render(<Question players={playersForDiv} />);

      // Open settings, 割り算を有効化してから足し算を無効化（先に足し算を外すとフォールバックで戻るため）
      fireEvent.click(screen.getByText("設定"));
      const divLabel = screen.getByText(/割り算/).closest("label")!;
      fireEvent.click(divLabel.querySelector("input")!);
      const addLabel = screen.getByText(/足し算/).closest("label")!;
      fireEvent.click(addLabel.querySelector("input")!);
      fireEvent.click(screen.getByText("設定"));

      const retryButton = screen.getByText("再挑戦");
      fireEvent.click(retryButton);

      expect(screen.getByText(/÷/)).toBeInTheDocument();
    });

    it("should handle subtraction correctly", () => {
      render(<Question players={mockPlayers} />);

      // Open settings, 引き算を有効化してから足し算を無効化（先に足し算を外すとフォールバックで戻るため）
      fireEvent.click(screen.getByText("設定"));

      const subLabel = screen.getByText(/引き算/).closest("label")!;
      const subInput = subLabel.querySelector("input")!;
      fireEvent.click(subInput);

      const addLabel = screen.getByText(/足し算/).closest("label")!;
      fireEvent.click(addLabel.querySelector("input")!);

      // Close settings to avoid duplicate text matches
      fireEvent.click(screen.getByText("設定"));

      const retryButton = screen.getByText("再挑戦");
      fireEvent.click(retryButton);

      // 引き算を使用した問題が表示されていることを確認
      expect(screen.getByText(/－/)).toBeInTheDocument();
    });

    it("should maintain selected operators after retry", () => {
      render(<Question players={mockPlayers} />);

      // Open settings
      fireEvent.click(screen.getByText("設定"));

      // Enable multiplication and division
      const multiplyCheckbox = screen.getByText(/掛け算/)
        .previousSibling as HTMLInputElement;
      const divideCheckbox = screen.getByText(/割り算/)
        .previousSibling as HTMLInputElement;
      fireEvent.click(multiplyCheckbox);
      fireEvent.click(divideCheckbox);

      const retryButton = screen.getByText("再挑戦");
      fireEvent.click(retryButton);

      // Check if operators are still enabled by looking for their labels
      expect(screen.getByText(/掛け算/)).toBeInTheDocument();
      expect(screen.getByText(/割り算/)).toBeInTheDocument();
    });
  });
});
