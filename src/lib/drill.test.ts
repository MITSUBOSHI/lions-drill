import { evaluateExpression, generateQuestionWithOperators } from "./drill";
import { PlayerType, Role } from "@/types/Player";

function makePlayer(
  number: number,
  name: string = `選手${number}`,
): PlayerType {
  return {
    year: 2026,
    name,
    name_kana: `せんしゅ${number}`,
    uniform_name: `PLAYER${number}`,
    number_calc: number,
    number_disp: String(number),
    role: Role.Roster,
    url: "",
    date_of_birth: "2000-01-01",
    height_cm: 180,
    weight_kg: 80,
  };
}

describe("generateQuestionWithOperators", () => {
  describe("加算", () => {
    it("2人の選手の背番号を足し算する", () => {
      const players = [makePlayer(3), makePlayer(5)];
      const result = generateQuestionWithOperators(players, ["+"]);
      expect(result.correctNumber).toBe(8);
    });
  });

  describe("減算", () => {
    it("2人の選手の背番号を引き算する", () => {
      const players = [makePlayer(10), makePlayer(3)];
      const result = generateQuestionWithOperators(players, ["-"], ["-"]);
      expect(result.correctNumber).toBe(7);
    });
  });

  describe("乗算", () => {
    it("2人の選手の背番号を掛け算する", () => {
      const players = [makePlayer(4), makePlayer(6)];
      const result = generateQuestionWithOperators(players, ["*"], ["*"]);
      expect(result.correctNumber).toBe(24);
    });
  });

  describe("除算", () => {
    it("割り切れる場合は除算結果を返す", () => {
      const players = [makePlayer(12), makePlayer(3)];
      const result = generateQuestionWithOperators(players, ["/"], ["/"]);
      expect(result.correctNumber).toBe(4);
    });

    it("割り切れない場合は加算にフォールバックする", () => {
      const players = [makePlayer(7), makePlayer(3)];
      const result = generateQuestionWithOperators(players, ["/"], ["/"]);
      // 7 / 3 は割り切れないので 7 + 3 = 10 にフォールバック
      expect(result.correctNumber).toBe(10);
      expect(result.operatorSequence).toEqual(["/"]);
    });

    it("0で割る場合は加算にフォールバックする", () => {
      const players = [makePlayer(5), makePlayer(0)];
      const result = generateQuestionWithOperators(players, ["/"], ["/"]);
      // 5 / 0 は不可なので 5 + 0 = 5 にフォールバック
      expect(result.correctNumber).toBe(5);
    });
  });

  describe("3人以上の選手", () => {
    it("3人の選手で固定演算子シーケンスを使う", () => {
      const players = [makePlayer(10), makePlayer(3), makePlayer(2)];
      const result = generateQuestionWithOperators(
        players,
        ["+", "-"],
        ["+", "-"],
      );
      // (10 + 3) - 2 = 11
      expect(result.correctNumber).toBe(11);
    });
  });

  describe("表示", () => {
    it("選手名を漢字で表示する", () => {
      const players = [makePlayer(3, "佐野"), makePlayer(5, "牧")];
      const result = generateQuestionWithOperators(players, ["+"], ["+"]);
      expect(result.questionSentence).toBe("佐野 ＋ 牧");
    });
  });

  describe("演算子の優先順位", () => {
    it("掛け算を足し算より先に計算する", () => {
      const players = [makePlayer(2), makePlayer(3), makePlayer(4)];
      const result = generateQuestionWithOperators(
        players,
        ["+", "*"],
        ["+", "*"],
      );
      // 2 + 3 × 4 = 14（左から順に計算した20ではない）
      expect(result.correctNumber).toBe(14);
    });

    it("割り算を引き算より先に計算する", () => {
      const players = [makePlayer(10), makePlayer(6), makePlayer(2)];
      const result = generateQuestionWithOperators(
        players,
        ["-", "/"],
        ["-", "/"],
      );
      // 10 - 6 ÷ 2 = 7
      expect(result.correctNumber).toBe(7);
    });

    it("優先順位で評価できない場合は式全体を加算にフォールバックする", () => {
      // 7 ÷ 3 は割り切れない。部分的なフォールバックだと表示と答えがずれるため全体を加算にする
      const players = [makePlayer(7), makePlayer(3), makePlayer(2)];
      const result = generateQuestionWithOperators(
        players,
        ["/", "*"],
        ["/", "*"],
      );
      // 7 + 3 + 2 = 12
      expect(result.correctNumber).toBe(12);
      expect(result.operatorSymbols).toEqual(["＋", "＋"]);
    });

    it("生成された問題の答えは優先順位評価と一致し0以上の整数になる", () => {
      const players = [makePlayer(5), makePlayer(3), makePlayer(10)];
      for (let i = 0; i < 20; i++) {
        const result = generateQuestionWithOperators(players, [
          "+",
          "-",
          "*",
          "/",
        ]);
        const evaluated = evaluateExpression(
          players.map((p) => p.number_calc),
          result.operatorSequence,
        );
        expect(evaluated).toBe(result.correctNumber);
        expect(result.correctNumber).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(result.correctNumber)).toBe(true);
      }
    });
  });
});

describe("evaluateExpression", () => {
  it("足し算・引き算は左から計算する", () => {
    expect(evaluateExpression([7, 2], ["+"])).toBe(9);
    expect(evaluateExpression([7, 2], ["-"])).toBe(5);
    expect(evaluateExpression([7, 2, 3], ["-", "+"])).toBe(8);
  });

  it("掛け算・割り算を優先する", () => {
    // 5 - 3 × 10 = -25（×を先に計算する）
    expect(evaluateExpression([5, 3, 10], ["-", "*"])).toBe(-25);
    expect(evaluateExpression([2, 3, 4], ["+", "*"])).toBe(14);
    expect(evaluateExpression([10, 6, 2], ["+", "/"])).toBe(13);
  });

  it("割り切れない除算はnullを返す", () => {
    expect(evaluateExpression([7, 2], ["/"])).toBeNull();
    expect(evaluateExpression([7, 0], ["/"])).toBeNull();
    expect(evaluateExpression([6, 2], ["/"])).toBe(3);
  });
});
