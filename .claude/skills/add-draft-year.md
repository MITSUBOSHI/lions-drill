# ドラフトデータ追加スキル

新しい年度のドラフトデータを追加する手順。

## データソース

NPB公式ドラフト会議ページ:
`https://draft.npb.jp/draft/${year}/draftlist_db.html`

各球団の選択選手一覧が掲載されている。横浜DeNAベイスターズのデータのみ抽出する。

**注意**: ハズレ1位（抽選外れ）の情報はNPBページには掲載されていない。スポーツニュースサイト等で別途調査が必要。

## 手順

### 1. NPBページからデータ取得

WebFetchで `https://draft.npb.jp/draft/${year}/draftlist_db.html` にアクセスし、横浜DeNAベイスターズの指名選手を全て抽出する。

取得する情報:
- 新人選手選択会議 / 育成選手選択会議 の区分
- 順位 (1位, 2位, ...)
- 選手名
- ポジション (投手/捕手/内野手/外野手)
- 出身校・チーム名

### 2. ハズレ1位の調査

WebSearchで「${year}年ドラフト DeNA 外れ1位」等を検索し、1位指名が抽選外れだったかどうかを確認する。

### 3. JSONデータファイル作成

`src/data/draft/${year}.json` を以下のフォーマットで作成:

```json
[
  {
    "year": 2026,
    "category": "regular",
    "round": 1,
    "name": "選手名",
    "position": "投手",
    "team": "出身校",
    "isLotteryLoss": false
  }
]
```

- `category`: `"regular"` (新人選手) or `"development"` (育成選手)
- `isLotteryLoss`: ハズレ1位の場合のみ `true`

### 4. 定数にyear追加

`src/constants/draft.ts` の `draftYears` 配列に新しい年を追加:

```typescript
export const draftYears = [
  2012, 2013, ..., 2025, 2026,  // ← 追加
] as const;
```

### 5. データローダーに追加

`src/lib/draft.ts` に:
1. importを追加: `import Draft2026 from "@/data/draft/2026.jsonl.json";`
2. mapに追加: `2026: Draft2026 as DraftPick[],`

### 6. ビルド確認

```bash
npm run lint
npm run build
```

## 既存データのハズレ1位一覧 (参考)

| 年 | 1位指名選手 | 外した選手 |
|----|-----------|----------|
| 2012 | 白崎浩之 | 東浜巨 |
| 2013 | 柿田裕太 | 松井裕樹 |
| 2016 | 濱口遥大 | 柳裕也 |
| 2018 | 上茶谷大河 | 小園海斗 |
| 2024 | 竹田祐 | 金丸夢斗 |
| 2025 | 小田康一郎 | 佐々木麟太郎 |
