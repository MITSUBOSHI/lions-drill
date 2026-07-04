import { encodeLineupParams, decodeLineupParams } from "./lineupUrl";
import type { LineupUrlState } from "./lineupUrl";
import { PlayerType, Role } from "@/types/Player";

const player = (
  number_disp: string,
  name: string,
  number_calc?: number,
): PlayerType => ({
  year: 2026,
  name,
  name_kana: "",
  uniform_name: "",
  number_calc: number_calc ?? parseInt(number_disp, 10),
  number_disp,
  role: Role.Roster,
  url: "",
  date_of_birth: "2000-01-01",
  height_cm: 180,
  weight_kg: 80,
});

const allPlayers: PlayerType[] = [
  player("11", "東 克樹"),
  player("2", "牧 秀悟"),
  player("50", "山本 祐大"),
  player("51", "宮﨑 敏郎"),
  player("7", "佐野 恵太"),
  player("3", "オースティン"),
  player("44", "度会 隆輝"),
  player("9", "桑原 将志"),
  player("00", "松尾 汐恩", 0),
  player("122", "育成選手", 122),
  player("29", "ジャクソン"),
];

describe("lineupUrl", () => {
  describe("encodeLineupParams", () => {
    it("空のラインナップでは lineup パラメータなし", () => {
      const state: LineupUrlState = {
        lineup: [
          { order: null, player: null, position: "投手" },
          { order: null, player: null, position: "捕手" },
        ],
        startingPitcher: null,
        hasDH: false,
        isFarmMode: false,
        nameDisplay: "kanji",
        customTitle: "",
      };
      const params = encodeLineupParams(state);
      expect(params.has("lineup")).toBe(false);
    });

    it("フルラインナップをエンコードする", () => {
      const state: LineupUrlState = {
        lineup: [
          { order: 9, player: allPlayers[0], position: "投手" },
          { order: 1, player: allPlayers[2], position: "捕手" },
          { order: 3, player: allPlayers[1], position: "一塁手" },
          { order: 4, player: allPlayers[3], position: "二塁手" },
          { order: 5, player: allPlayers[4], position: "三塁手" },
          { order: 2, player: allPlayers[5], position: "遊撃手" },
          { order: 6, player: allPlayers[6], position: "左翼手" },
          { order: 7, player: allPlayers[7], position: "中堅手" },
          { order: 8, player: allPlayers[8], position: "右翼手" },
        ],
        startingPitcher: allPlayers[0],
        hasDH: false,
        isFarmMode: false,
        nameDisplay: "kanji",
        customTitle: "",
      };
      const params = encodeLineupParams(state);
      const lineup = params.get("lineup")!;
      expect(lineup).toContain("9p11");
      expect(lineup).toContain("1c50");
      expect(lineup).toContain("3f2");
      expect(lineup).toContain("4n51");
      expect(lineup).toContain("5t7");
      expect(lineup).toContain("2s3");
      expect(lineup).toContain("6l44");
      expect(lineup).toContain("7m9");
      expect(lineup).toContain("8r00");
      expect(params.get("sp")).toBe("11");
    });

    it("打順未設定は order=0 でエンコードする", () => {
      const state: LineupUrlState = {
        lineup: [{ order: null, player: allPlayers[0], position: "投手" }],
        startingPitcher: null,
        hasDH: false,
        isFarmMode: false,
        nameDisplay: "kanji",
        customTitle: "",
      };
      const params = encodeLineupParams(state);
      expect(params.get("lineup")).toBe("0p11");
    });

    it("デフォルト値は省略する", () => {
      const state: LineupUrlState = {
        lineup: [{ order: 1, player: allPlayers[0], position: "投手" }],
        startingPitcher: null,
        hasDH: false,
        isFarmMode: false,
        nameDisplay: "kanji",
        customTitle: "",
      };
      const params = encodeLineupParams(state);
      expect(params.has("dh")).toBe(false);
      expect(params.has("farm")).toBe(false);
      expect(params.has("name")).toBe(false);
      expect(params.has("title")).toBe(false);
    });

    it("非デフォルト設定をエンコードする", () => {
      const state: LineupUrlState = {
        lineup: [{ order: 1, player: allPlayers[0], position: "投手" }],
        startingPitcher: allPlayers[0],
        hasDH: true,
        isFarmMode: true,
        nameDisplay: "both",
        customTitle: "ベイスターズ打線",
      };
      const params = encodeLineupParams(state);
      expect(params.get("dh")).toBe("1");
      expect(params.get("farm")).toBe("1");
      expect(params.get("name")).toBe("both");
      expect(params.get("title")).toBe("ベイスターズ打線");
    });

    it("DHモードで DH ポジションをエンコードする", () => {
      const state: LineupUrlState = {
        lineup: [
          { order: 1, player: allPlayers[10], position: "DH" },
          { order: 2, player: allPlayers[2], position: "捕手" },
        ],
        startingPitcher: allPlayers[0],
        hasDH: true,
        isFarmMode: false,
        nameDisplay: "kanji",
        customTitle: "",
      };
      const params = encodeLineupParams(state);
      expect(params.get("lineup")).toContain("1d29");
      expect(params.get("lineup")).toContain("2c50");
    });
  });

  describe("decodeLineupParams", () => {
    it("lineup パラメータがない場合 null を返す", () => {
      const params = new URLSearchParams();
      expect(decodeLineupParams(params, allPlayers)).toBeNull();
    });

    it("lineup 文字列をデコードする", () => {
      const params = new URLSearchParams("lineup=1c50.2s3.3f2&sp=11");
      const result = decodeLineupParams(params, allPlayers)!;
      expect(result).not.toBeNull();

      const catcher = result.lineup.find((s) => s.position === "捕手");
      expect(catcher?.order).toBe(1);
      expect(catcher?.player?.number_disp).toBe("50");

      const ss = result.lineup.find((s) => s.position === "遊撃手");
      expect(ss?.order).toBe(2);
      expect(ss?.player?.number_disp).toBe("3");

      expect(result.startingPitcher?.number_disp).toBe("11");
    });

    it("設定パラメータをデコードする", () => {
      const params = new URLSearchParams(
        "lineup=1c50&dh=1&farm=1&name=both&title=テスト",
      );
      const result = decodeLineupParams(params, allPlayers)!;
      expect(result.hasDH).toBe(true);
      expect(result.isFarmMode).toBe(true);
      expect(result.nameDisplay).toBe("both");
      expect(result.customTitle).toBe("テスト");
    });

    it("デフォルト設定を正しく適用する", () => {
      const params = new URLSearchParams("lineup=1c50");
      const result = decodeLineupParams(params, allPlayers)!;
      expect(result.hasDH).toBe(false);
      expect(result.isFarmMode).toBe(false);
      expect(result.nameDisplay).toBe("kanji");
      expect(result.customTitle).toBe("");
      expect(result.startingPitcher).toBeNull();
    });

    it("未使用ポジションを空で補完する", () => {
      const params = new URLSearchParams("lineup=1c50");
      const result = decodeLineupParams(params, allPlayers)!;
      // 9ポジション全て含まれる
      expect(result.lineup.length).toBe(9);
      const pitcher = result.lineup.find((s) => s.position === "投手");
      expect(pitcher?.player).toBeNull();
      expect(pitcher?.order).toBeNull();
    });

    it("DHモードでは DH を含み投手を含まない", () => {
      const params = new URLSearchParams("lineup=1d29&dh=1");
      const result = decodeLineupParams(params, allPlayers)!;
      const positions = result.lineup.map((s) => s.position);
      expect(positions).toContain("DH");
      expect(positions).not.toContain("投手");
    });

    it("打順 0 は null にデコードする", () => {
      const params = new URLSearchParams("lineup=0p11");
      const result = decodeLineupParams(params, allPlayers)!;
      const pitcher = result.lineup.find((s) => s.position === "投手");
      expect(pitcher?.order).toBeNull();
      expect(pitcher?.player?.number_disp).toBe("11");
    });

    it("存在しない選手番号は player=null になる", () => {
      const params = new URLSearchParams("lineup=1c999");
      const result = decodeLineupParams(params, allPlayers)!;
      const catcher = result.lineup.find((s) => s.position === "捕手");
      expect(catcher?.player).toBeNull();
    });

    it("number_disp が 00 や 122 でも正しくデコードする", () => {
      const params = new URLSearchParams("lineup=1c00.2f122");
      const result = decodeLineupParams(params, allPlayers)!;
      const catcher = result.lineup.find((s) => s.position === "捕手");
      expect(catcher?.player?.number_disp).toBe("00");
      const first = result.lineup.find((s) => s.position === "一塁手");
      expect(first?.player?.number_disp).toBe("122");
    });

    it("不正なエントリはスキップする", () => {
      const params = new URLSearchParams("lineup=1c50.invalid.2s3");
      const result = decodeLineupParams(params, allPlayers)!;
      const withPlayers = result.lineup.filter((s) => s.player !== null);
      expect(withPlayers.length).toBe(2);
    });
  });

  describe("ラウンドトリップ", () => {
    it("encode → decode で同一状態を復元する", () => {
      const original: LineupUrlState = {
        lineup: [
          { order: 1, player: allPlayers[2], position: "捕手" },
          { order: 2, player: allPlayers[5], position: "遊撃手" },
          { order: 3, player: allPlayers[1], position: "一塁手" },
          { order: 4, player: allPlayers[3], position: "二塁手" },
          { order: 5, player: allPlayers[4], position: "三塁手" },
          { order: 6, player: allPlayers[6], position: "左翼手" },
          { order: 7, player: allPlayers[7], position: "中堅手" },
          { order: 8, player: allPlayers[8], position: "右翼手" },
          { order: 9, player: allPlayers[10], position: "DH" },
        ],
        startingPitcher: allPlayers[0],
        hasDH: true,
        isFarmMode: true,
        nameDisplay: "both",
        customTitle: "テスト打線",
      };
      const params = encodeLineupParams(original);
      const decoded = decodeLineupParams(params, allPlayers)!;

      expect(decoded.hasDH).toBe(original.hasDH);
      expect(decoded.isFarmMode).toBe(original.isFarmMode);
      expect(decoded.nameDisplay).toBe(original.nameDisplay);
      expect(decoded.customTitle).toBe(original.customTitle);
      expect(decoded.startingPitcher?.number_disp).toBe(
        original.startingPitcher?.number_disp,
      );

      for (const origSpot of original.lineup) {
        const decodedSpot = decoded.lineup.find(
          (s) => s.position === origSpot.position,
        );
        expect(decodedSpot).toBeDefined();
        expect(decodedSpot?.order).toBe(origSpot.order);
        expect(decodedSpot?.player?.number_disp).toBe(
          origSpot.player?.number_disp,
        );
      }
    });
  });
});
