import {
  encodeCustomLineupParams,
  decodeCustomLineupParams,
  createDefaultCustomLineup,
  CUSTOM_LINEUP_SIZE,
  CUSTOM_NAME_MAX_LENGTH,
  CUSTOM_MEMO_MAX_LENGTH,
  CUSTOM_TITLE_MAX_LENGTH,
  CUSTOM_ITEM_LABEL_MAX_LENGTH,
  type CustomLineupUrlState,
} from "./lineupCustomUrl";

describe("lineupCustomUrl", () => {
  describe("createDefaultCustomLineup", () => {
    it("9枠の空ラインナップを生成する", () => {
      const lineup = createDefaultCustomLineup();
      expect(lineup).toHaveLength(CUSTOM_LINEUP_SIZE);
      lineup.forEach((spot, index) => {
        expect(spot.order).toBe(index + 1);
        expect(spot.name).toBe("");
        expect(spot.memo).toBe("");
      });
    });
  });

  describe("encodeCustomLineupParams", () => {
    it("空の状態ではパラメータが空", () => {
      const state: CustomLineupUrlState = {
        lineup: createDefaultCustomLineup(),
        customTitle: "",
        itemLabel: "",
      };
      const params = encodeCustomLineupParams(state);
      expect(params.toString()).toBe("");
    });

    it("名前・メモ・タイトル・ラベルをエンコードする", () => {
      const lineup = createDefaultCustomLineup();
      lineup[0].name = "佐野";
      lineup[0].memo = "主将";
      lineup[2].name = "牧";
      const state: CustomLineupUrlState = {
        lineup,
        customTitle: "私的スタメン",
        itemLabel: "選手名",
      };
      const params = encodeCustomLineupParams(state);
      expect(params.get("n1")).toBe("佐野");
      expect(params.get("m1")).toBe("主将");
      expect(params.get("n3")).toBe("牧");
      expect(params.has("m3")).toBe(false);
      expect(params.get("title")).toBe("私的スタメン");
      expect(params.get("label")).toBe("選手名");
    });

    it("空文字のラベルはエンコードされない", () => {
      const state: CustomLineupUrlState = {
        lineup: createDefaultCustomLineup(),
        customTitle: "テスト",
        itemLabel: "",
      };
      const params = encodeCustomLineupParams(state);
      expect(params.has("label")).toBe(false);
      expect(params.get("title")).toBe("テスト");
    });
  });

  describe("decodeCustomLineupParams", () => {
    it("パラメータがない場合は null", () => {
      const params = new URLSearchParams();
      expect(decodeCustomLineupParams(params)).toBeNull();
    });

    it("名前・メモ・タイトル・ラベルをデコードする", () => {
      const params = new URLSearchParams();
      params.set("n1", "佐野");
      params.set("m1", "主将");
      params.set("n3", "牧");
      params.set("title", "私的スタメン");
      params.set("label", "ニュース");

      const decoded = decodeCustomLineupParams(params);
      expect(decoded).not.toBeNull();
      expect(decoded!.customTitle).toBe("私的スタメン");
      expect(decoded!.itemLabel).toBe("ニュース");
      expect(decoded!.lineup).toHaveLength(CUSTOM_LINEUP_SIZE);
      expect(decoded!.lineup[0].name).toBe("佐野");
      expect(decoded!.lineup[0].memo).toBe("主将");
      expect(decoded!.lineup[1].name).toBe("");
      expect(decoded!.lineup[2].name).toBe("牧");
    });

    it("タイトル/ラベルのみでもデコードできる", () => {
      const params = new URLSearchParams();
      params.set("title", "T");
      const decoded = decodeCustomLineupParams(params);
      expect(decoded).not.toBeNull();
      expect(decoded!.customTitle).toBe("T");
      expect(decoded!.itemLabel).toBe("");

      const params2 = new URLSearchParams();
      params2.set("label", "L");
      const decoded2 = decodeCustomLineupParams(params2);
      expect(decoded2).not.toBeNull();
      expect(decoded2!.itemLabel).toBe("L");
    });

    it("最大長を超える値は切り詰める", () => {
      const longName = "あ".repeat(CUSTOM_NAME_MAX_LENGTH + 5);
      const longMemo = "い".repeat(CUSTOM_MEMO_MAX_LENGTH + 5);
      const longTitle = "う".repeat(CUSTOM_TITLE_MAX_LENGTH + 5);
      const longLabel = "え".repeat(CUSTOM_ITEM_LABEL_MAX_LENGTH + 5);
      const params = new URLSearchParams();
      params.set("n1", longName);
      params.set("m1", longMemo);
      params.set("title", longTitle);
      params.set("label", longLabel);

      const decoded = decodeCustomLineupParams(params)!;
      expect(decoded.lineup[0].name).toHaveLength(CUSTOM_NAME_MAX_LENGTH);
      expect(decoded.lineup[0].memo).toHaveLength(CUSTOM_MEMO_MAX_LENGTH);
      expect(decoded.customTitle).toHaveLength(CUSTOM_TITLE_MAX_LENGTH);
      expect(decoded.itemLabel).toHaveLength(CUSTOM_ITEM_LABEL_MAX_LENGTH);
    });
  });

  describe("encode → decode のラウンドトリップ", () => {
    it("元の状態を復元できる", () => {
      const lineup = createDefaultCustomLineup();
      lineup[0].name = "1番選手";
      lineup[0].memo = "選出理由1";
      lineup[4].name = "5番選手";
      lineup[8].name = "9番選手";
      lineup[8].memo = "選出理由9";
      const state: CustomLineupUrlState = {
        lineup,
        customTitle: "ラウンドトリップ",
        itemLabel: "テーマ",
      };

      const decoded = decodeCustomLineupParams(encodeCustomLineupParams(state));
      expect(decoded).not.toBeNull();
      expect(decoded!.customTitle).toBe(state.customTitle);
      expect(decoded!.itemLabel).toBe(state.itemLabel);
      expect(decoded!.lineup).toEqual(lineup);
    });
  });
});
