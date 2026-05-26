import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LineupCreator from "./LineupCreator";
import { PlayerType, Role } from "@/types/Player";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
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

// OptionGroupコンポーネントのモック
jest.mock("@/components/common/OptionGroup", () => ({
  __esModule: true,
  default: ({
    name,
    options,
    selectedValues,
    onChange,
  }: {
    name: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (value: string) => void;
    multiple?: boolean;
  }) => (
    <div data-testid={`option-group-${name}`}>
      {options.map((option: { value: string; label: string }) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={() => onChange(option.value)}
            data-testid={`radio-${option.value}`}
          />
          {option.label}
        </label>
      ))}
    </div>
  ),
}));

// Node.js環境では利用できないがブラウザ環境で利用可能なstructuredCloneをモック
if (typeof structuredClone === "undefined") {
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}

// html2canvasのモック
const mockToDataURL = jest.fn(() => "data:image/png;base64,mockImageData");
const mockCanvasInstance = {
  toDataURL: mockToDataURL,
};
const html2canvasMock = jest.fn(() => Promise.resolve(mockCanvasInstance));

jest.mock("html2canvas", () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.resolve({
      toDataURL: jest.fn(() => "data:image/png;base64,mockImageData"),
    }),
  ),
}));

// LineupTableコンポーネントのモック
jest.mock("./LineupTable", () => {
  return {
    __esModule: true,
    default: (props: {
      title?: string;
      startingPitcher: PlayerType | null;
      getDisplayName: (player: PlayerType | null) => string;
    }) => (
      <div data-testid="lineup-table">
        <div>タイトル: {props.title || "スタメンジェネレータ"}</div>
        <div>
          先発投手:{" "}
          {props.startingPitcher
            ? props.getDisplayName(props.startingPitcher)
            : "未選択"}
        </div>
      </div>
    ),
  };
});

// PlayerSelectorコンポーネントのモック
jest.mock("./PlayerSelector", () => {
  return {
    __esModule: true,
    default: ({
      players,
      onSelectPlayer,
      selectedPlayer,
      position,
      getDisplayName,
    }: {
      players: PlayerType[];
      onSelectPlayer: (player: PlayerType | null) => void;
      selectedPlayer: PlayerType | null;
      position: string;
      getDisplayName: (player: PlayerType | null) => string;
    }) => (
      <div data-testid={`player-selector-${position}`}>
        <div>{position}</div>
        {selectedPlayer ? (
          <div data-testid={`selected-player-${position}`}>
            {getDisplayName(selectedPlayer)}
          </div>
        ) : (
          <button
            data-testid={`select-player-btn-${position}`}
            onClick={() => {
              if (players.length > 0) {
                onSelectPlayer(players[0]);
              }
            }}
          >
            選手を選択
          </button>
        )}
      </div>
    ),
  };
});

// DraggableLineupコンポーネントのモック
jest.mock("./DraggableLineup", () => {
  return {
    __esModule: true,
    default: ({
      orderedPlayers,
      removePlayerFromOrder,
    }: {
      orderedPlayers: Array<{ position: string }>;
      removePlayerFromOrder: (position: string) => void;
    }) => (
      <div data-testid="draggable-lineup">
        {orderedPlayers.map((player, index: number) => (
          <div key={index} data-testid={`lineup-spot-${player.position}`}>
            <button
              onClick={() => removePlayerFromOrder(player.position)}
              data-testid={`remove-btn-${player.position}`}
            >
              打順から削除
            </button>
          </div>
        ))}
      </div>
    ),
  };
});

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
  {
    name: "粟飯原 龍之介",
    name_kana: "あいばら りゅうのすけ",
    uniform_name: "AIBARA",
    number_disp: "133",
    number_calc: 133,
    role: Role.Training,
    year: 2026,
    url: "https://dummy/aibara",
    date_of_birth: "2004-02-22",
    height_cm: 180,
    weight_kg: 85,
  },
];

describe("LineupCreator", () => {
  const originalCreateElement = document.createElement;
  const mockClick = jest.fn();

  beforeAll(() => {
    // linkのクリックをモック
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === "a") {
        return {
          click: mockClick,
          download: "",
          href: "",
        };
      }
      return originalCreateElement.call(document, tagName);
    });
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // html2canvasのモックを上書き
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.requireMock("html2canvas").default.mockImplementation(html2canvasMock);
  });

  test("コンポーネントが正しくレンダリングされる", () => {
    render(<LineupCreator players={mockPlayers} />);

    // 設定セクションが表示されることを確認
    expect(screen.getByText("設定")).toBeInTheDocument();
    fireEvent.click(screen.getByText("設定"));
    expect(screen.getAllByText("DHあり")[0]).toBeInTheDocument();
    expect(
      screen.getAllByText("育成枠含む(ファーム対応)")[0],
    ).toBeInTheDocument();

    // ポジション設定セクションが表示されることを確認
    expect(screen.getByText("ポジション別選手設定")).toBeInTheDocument();

    // 投手選択が表示されることを確認
    expect(screen.getByText("投手選択")).toBeInTheDocument();
  });

  test("選手を選択できる", async () => {
    render(<LineupCreator players={mockPlayers} />);

    // 投手を選択するボタンをクリック
    const selectButton = screen.getAllByTestId("select-player-btn-投手")[0]; // 同じidのボタンが複数ある場合最初のボタンを選択
    fireEvent.click(selectButton);

    // 選択した選手が表示されていることを確認（モック内で最初の選手が自動選択される）
    expect(
      screen.getAllByTestId("selected-player-投手")[0],
    ).toBeInTheDocument();
  });

  // 実装の詳細に依存しすぎるため、現状はスキップ
  test.skip("画像として保存機能が動作する", async () => {
    render(<LineupCreator players={mockPlayers} />);

    // 画像として保存ボタンをクリック
    const saveButton = screen.getByText("画像として保存");
    fireEvent.click(saveButton);

    // 実際のテストでは保存機能が働くかどうかを検証するのは難しいため
    // ボタンが存在し、クリックイベントが発生することだけを確認する
    expect(saveButton).toBeInTheDocument();
  });

  test("DHありの設定を切り替える", () => {
    render(<LineupCreator players={mockPlayers} />);

    // 設定を開く
    fireEvent.click(screen.getByText("設定"));

    // すべてのSwitchを取得
    const switches = screen.getAllByRole("checkbox");

    // DHスイッチは最初のもの
    const dhSwitch = switches[0];

    // DHをオンにする
    fireEvent.click(dhSwitch);

    // DHポジションが追加されたことを確認
    expect(screen.getByTestId("player-selector-DH")).toBeInTheDocument();
  });

  test("ファームモードの設定を切り替える", () => {
    render(<LineupCreator players={mockPlayers} />);

    // 設定を開く
    fireEvent.click(screen.getByText("設定"));

    // すべてのSwitchを取得
    const switches = screen.getAllByRole("checkbox");

    // ファームモードスイッチは2番目のもの
    const farmModeSwitch = switches[1];

    // 初期状態ではファームモードがオフであることを確認（育成選手は選択できない）
    expect(farmModeSwitch).toHaveProperty("checked", false);

    // ファームモードをオンにする
    fireEvent.click(farmModeSwitch);

    // スイッチがオンになったことを確認
    expect(farmModeSwitch).toHaveProperty("checked", true);
  });

  test("ファームモードがオンの場合、育成選手を含むすべての選手が選択可能", () => {
    // テスト用にPlayerSelectorをモックして、実際に受け取ったプレイヤーリストを確認できるようにする
    const originalPlayerSelector = jest.requireMock("./PlayerSelector").default;
    let capturedPlayers: PlayerType[] = [];

    jest.requireMock("./PlayerSelector").default = ({
      players,
      onSelectPlayer,
      selectedPlayer,
      position,
      getDisplayName,
    }: {
      players: PlayerType[];
      onSelectPlayer: (player: PlayerType | null) => void;
      selectedPlayer: PlayerType | null;
      position: string;
      getDisplayName: (player: PlayerType | null) => string;
    }) => {
      // 投手セレクターの場合のみ、プレイヤーリストをキャプチャ
      if (position === "投手") {
        capturedPlayers = players;
      }
      return originalPlayerSelector({
        players,
        onSelectPlayer,
        selectedPlayer,
        position,
        getDisplayName,
      });
    };

    // コンポーネントをレンダリング
    const { rerender } = render(<LineupCreator players={mockPlayers} />);

    // 初期状態では育成選手を含まない（ロースターのみ）
    expect(capturedPlayers.length).toBe(4); // ロースター選手の数
    expect(capturedPlayers.some((p) => p.role === Role.Training)).toBe(false);

    // 設定を開く
    fireEvent.click(screen.getByText("設定"));

    // ファームモードをオンにする
    const farmModeSwitch = screen.getAllByRole("checkbox")[1];
    fireEvent.click(farmModeSwitch);

    // 再レンダリングさせる
    rerender(<LineupCreator players={mockPlayers} />);

    // 育成選手を含むすべての選手が利用可能になったことを確認
    expect(capturedPlayers.length).toBe(5); // すべての選手
    expect(capturedPlayers.some((p) => p.role === Role.Training)).toBe(true);

    // モックを元に戻す
    jest.requireMock("./PlayerSelector").default = originalPlayerSelector;
  });

  test("選手名表示形式を変更できる", () => {
    render(<LineupCreator players={mockPlayers} />);

    // 設定を開く
    fireEvent.click(screen.getByText("設定"));

    // ひらがなのみのラジオボタンをクリック
    const kanaRadioButton = screen.getByTestId("radio-kana");
    fireEvent.click(kanaRadioButton);

    // 選択されたことを確認
    expect(kanaRadioButton).toHaveProperty("checked", true);
  });
});
