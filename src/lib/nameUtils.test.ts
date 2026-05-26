import { extractFamilyNameKana } from "./nameUtils";

describe("extractFamilyNameKana", () => {
  it("日本人選手: スペース区切りの先頭を返す", () => {
    expect(extractFamilyNameKana("くわはら まさゆき")).toBe("くわはら");
  });

  it("日本人選手: 別の例", () => {
    expect(extractFamilyNameKana("まき しゅうご")).toBe("まき");
  });

  it("外国人選手: 中黒区切りの末尾を返す", () => {
    expect(extractFamilyNameKana("あんどれ\u30FBじゃくそん")).toBe(
      "じゃくそん",
    );
  });

  it("外国人選手: 別の例", () => {
    expect(extractFamilyNameKana("たいらー\u30FBおーすてぃん")).toBe(
      "おーすてぃん",
    );
  });

  it("単名選手: そのまま返す", () => {
    expect(extractFamilyNameKana("はやて")).toBe("はやて");
  });

  it("単名選手: 別の例", () => {
    expect(extractFamilyNameKana("れん")).toBe("れん");
  });
});
