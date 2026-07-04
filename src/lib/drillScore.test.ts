import { loadDrillScore, saveDrillScore, resetDrillScore } from "./drillScore";
import { TEAM } from "@/config/team";

const STORAGE_KEY = TEAM.storage.drillScoreKey;

describe("drillScore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存したスコアを読み込める", () => {
    saveDrillScore({ total: 10, correct: 7 });
    expect(loadDrillScore()).toEqual({ total: 10, correct: 7 });
  });

  it("未保存の場合は初期値を返す", () => {
    expect(loadDrillScore()).toEqual({ total: 0, correct: 0 });
  });

  it("不正なJSONが保存されていても初期値を返す", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{");
    expect(loadDrillScore()).toEqual({ total: 0, correct: 0 });
  });

  it("形の合わないオブジェクトは無視して初期値を返す", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ total: "3" }));
    expect(loadDrillScore()).toEqual({ total: 0, correct: 0 });
  });

  it("リセットでスコアが消える", () => {
    saveDrillScore({ total: 5, correct: 5 });
    resetDrillScore();
    expect(loadDrillScore()).toEqual({ total: 0, correct: 0 });
  });
});
