import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LineupCustomTable from "./LineupCustomTable";
import { createDefaultCustomLineup } from "@/lib/lineupCustomUrl";

describe("LineupCustomTable", () => {
  it("名前未入力の場合はラベル付き未入力メッセージを表示する", () => {
    render(<LineupCustomTable lineup={createDefaultCustomLineup()} />);
    expect(screen.getByText("選手名が入力されていません")).toBeInTheDocument();
  });

  it("itemLabel が指定された場合は未入力メッセージにも反映される", () => {
    render(
      <LineupCustomTable
        lineup={createDefaultCustomLineup()}
        itemLabel="ニュース"
      />,
    );
    expect(
      screen.getByText("ニュースが入力されていません"),
    ).toBeInTheDocument();
  });

  it("入力済の名前と打順がテーブルに表示される", () => {
    const lineup = createDefaultCustomLineup();
    lineup[0].name = "1番選手";
    lineup[1].name = "2番選手";
    render(
      <LineupCustomTable
        lineup={lineup}
        title="テストタイトル"
        itemLabel="選手名"
      />,
    );

    expect(screen.getByText("テストタイトル")).toBeInTheDocument();
    expect(screen.getByText("打順")).toBeInTheDocument();
    expect(screen.getByText("選手名")).toBeInTheDocument();
    expect(screen.getByText("1番選手")).toBeInTheDocument();
    expect(screen.getByText("2番選手")).toBeInTheDocument();
  });

  it("メモが1件もない場合は メモ列が表示されない", () => {
    const lineup = createDefaultCustomLineup();
    lineup[0].name = "AAA";
    render(<LineupCustomTable lineup={lineup} />);
    expect(screen.queryByText("メモ・理由")).not.toBeInTheDocument();
  });

  it("メモが1件でも入力されていればメモ列が表示される", () => {
    const lineup = createDefaultCustomLineup();
    lineup[0].name = "AAA";
    lineup[0].memo = "理由A";
    render(<LineupCustomTable lineup={lineup} />);
    expect(screen.getByText("メモ・理由")).toBeInTheDocument();
    expect(screen.getByText("理由A")).toBeInTheDocument();
  });

  it("9枠すべて埋まっている場合は完了メッセージを表示する", () => {
    const lineup = createDefaultCustomLineup().map((spot) => ({
      ...spot,
      name: `選手${spot.order}`,
    }));
    render(<LineupCustomTable lineup={lineup} />);
    expect(screen.getByText("打順設定完了 ⚾")).toBeInTheDocument();
  });

  it("isForImage の場合は完了メッセージを出さず Baystars Drill 表記を出す", () => {
    const lineup = createDefaultCustomLineup().map((spot) => ({
      ...spot,
      name: `選手${spot.order}`,
    }));
    render(<LineupCustomTable lineup={lineup} isForImage />);
    expect(screen.queryByText("打順設定完了 ⚾")).not.toBeInTheDocument();
    expect(screen.getByText("Baystars Drill で作成")).toBeInTheDocument();
  });

  it("一部のみ入力されている場合は残数メッセージを表示する", () => {
    const lineup = createDefaultCustomLineup();
    lineup[0].name = "X";
    lineup[1].name = "Y";
    render(<LineupCustomTable lineup={lineup} />);
    expect(screen.getByText("残り7枠が未入力です")).toBeInTheDocument();
  });
});
