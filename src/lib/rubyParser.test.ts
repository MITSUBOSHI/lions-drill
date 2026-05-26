import { parseLyricLine, replaceNamePlaceholder } from "./rubyParser";

describe("parseLyricLine", () => {
  it("プレーンテキストをそのまま返す", () => {
    const result = parseLyricLine("たたかうぞ");
    expect(result).toEqual([{ type: "text", content: "たたかうぞ" }]);
  });

  it("ルビ付きテキストをパースする", () => {
    const result = parseLyricLine("{闘志|とうし}みなぎらせて");
    expect(result).toEqual([
      { type: "ruby", base: "闘志", reading: "とうし" },
      { type: "text", content: "みなぎらせて" },
    ]);
  });

  it("複数のルビを含む行をパースする", () => {
    const result = parseLyricLine("{力|ちから}の{限|かぎ}り");
    expect(result).toEqual([
      { type: "ruby", base: "力", reading: "ちから" },
      { type: "text", content: "の" },
      { type: "ruby", base: "限", reading: "かぎ" },
      { type: "text", content: "り" },
    ]);
  });

  it("テキストの間にルビがある場合をパースする", () => {
    const result = parseLyricLine("たたかうぞ {闘志|とうし}みなぎらせて");
    expect(result).toEqual([
      { type: "text", content: "たたかうぞ " },
      { type: "ruby", base: "闘志", reading: "とうし" },
      { type: "text", content: "みなぎらせて" },
    ]);
  });

  it("空文字列を処理する", () => {
    const result = parseLyricLine("");
    expect(result).toEqual([]);
  });
});

describe("replaceNamePlaceholder", () => {
  it("{{name}} を選手名に置換する", () => {
    const result = replaceNamePlaceholder("ゆけゆけ {{name}}", "カツキ");
    expect(result).toBe("ゆけゆけ カツキ");
  });

  it("複数の {{name}} を全て置換する", () => {
    const result = replaceNamePlaceholder(
      "{{name}} {{name}} {{name}}",
      "ハンセル",
    );
    expect(result).toBe("ハンセル ハンセル ハンセル");
  });

  it("{{name}} がない場合はそのまま返す", () => {
    const result = replaceNamePlaceholder("たたかうぞ", "カツキ");
    expect(result).toBe("たたかうぞ");
  });
});
