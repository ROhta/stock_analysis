# 財務諸表可視化ツール

企業の財務諸表（P/L、B/S、C/F）をグラフで可視化するReactアプリケーションです。

## 使用方法

### 起動

```bash
cd financialStatements
pnpm install
pnpm dev
```

### アクセス

URLパラメータ `companyData` で表示する企業データのJSONファイル名を指定します。

```
http://localhost:5174/?companyData=kakiyasu2026
```

- `companyData` パラメータは必須です
- 指定されたファイルが存在しない場合は404エラーが表示されます

## 企業データJSON形式

企業データは `public` ディレクトリにJSONファイルとして配置します。

### 基本構造

```json
{
  "name": "株式会社サンプル",
  "code": "1234",
  "market": "東証プライム",
  "period": "2025年3月期",
  "announcementDate": "2025年5月15日",
  "chartSettings": { ... },
  "pl": { ... },
  "plComparison": [ ... ],
  "bs": { ... },
  "cf": { ... },
  "cfComparison": [ ... ],
  "comments": { ... }
}
```

### chartSettings（グラフ軸設定）

グラフのY軸の範囲と目盛りを設定します。単位は百万円です。

#### 大企業向け設定例（売上高1兆円規模）

```json
{
  "chartSettings": {
    "pl": {
      "domain": [0, 1500000],
      "ticks": [0, 300000, 600000, 900000, 1200000, 1500000]
    },
    "bs": {
      "domain": [0, 2000000],
      "ticks": [0, 500000, 1000000, 1500000, 2000000]
    },
    "cf": {
      "composition": {
        "domain": [-200000, 200000],
        "ticks": [-200000, -100000, 0, 100000, 200000]
      },
      "waterfall": {
        "domain": [-200000, 500000],
        "ticks": [-200000, 0, 100000, 200000, 300000, 400000, 500000]
      },
      "comparison": {
        "domain": [-200000, 500000],
        "ticks": [-200000, 0, 100000, 200000, 300000, 400000, 500000]
      }
    }
  }
}
```

#### 中小企業向け設定例（売上高50億円規模）

```json
{
  "chartSettings": {
    "pl": {
      "domain": [0, 6000],
      "ticks": [0, 1000, 2000, 3000, 4000, 5000, 6000]
    },
    "bs": {
      "domain": [0, 4000],
      "ticks": [0, 1000, 2000, 3000, 4000]
    },
    "cf": {
      "composition": {
        "domain": [-1000, 1000],
        "ticks": [-1000, -500, 0, 500, 1000]
      },
      "waterfall": {
        "domain": [-1000, 2000],
        "ticks": [-1000, 0, 500, 1000, 1500, 2000]
      },
      "comparison": {
        "domain": [-1000, 2000],
        "ticks": [-1000, 0, 500, 1000, 1500, 2000]
      }
    }
  }
}
```

`chartSettings` を省略した場合はデフォルト値が使用されます。

### comments（コメント設定）

B/SとC/Fセクションに表示するコメントをカスタマイズできます。

```json
{
  "comments": {
    "bs": {
      "assets": null,
      "liabilities": "自己資本比率45% - 業界平均を上回る水準"
    },
    "cf": {
      "operating": null,
      "investing": "※新工場建設による設備投資",
      "financing": false
    }
  }
}
```

#### 設定値

| 値 | 動作 |
|---|---|
| `null` または 未指定 | デフォルトコメントを表示（自動計算） |
| 文字列 | カスタムコメントを表示 |
| `false` | コメントを非表示 |

#### デフォルトコメント

| キー | デフォルト表示 |
|---|---|
| `bs.assets` | 「流動比率{X}% ／ 現金比率{Y}%」 |
| `bs.liabilities` | 「自己資本比率{X}%」 |
| `cf.operating` | 「営業CFマージン{X}% ／ 対純利益比{Y}%」 |
| `cf.investing` | なし |
| `cf.financing` | なし |

### 完全なJSONサンプル

`public/kakiyasu2026.json` を参照してください。
