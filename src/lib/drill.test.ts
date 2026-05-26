import { generateQuestionWithOperators } from "./drill";
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
});
