# Claude Code Agents

このディレクトリには、Claude CodeのTask toolから呼び出すカスタムエージェントが配置されています。

## 利用可能なエージェント

### financial-researcher

指定された企業の直近5年間の財務データ（P/L、B/S、C/F）と、事業・財務インパクトの大きかった出来事をDeepResearch（Web検索）を用いて調査し、Markdown形式のレポートを作成します。

#### 呼び出し方

Claude Codeの会話内で以下のように依頼してください：

```
トヨタ自動車の財務分析をfinancial-researcherエージェントで実行してください
```

または、Task toolを直接使用する場合：

```
subagent_type: financial-researcher
prompt: トヨタ自動車（証券コード: 7203）の財務分析を行ってください
```

#### 出力内容

- 企業概要（正式名称、証券コード、業種、主要事業）
- 損益計算書（P/L）の5年推移
- 貸借対照表（B/S）の5年推移
- キャッシュフロー計算書（C/F）の5年推移
- 財務分析（収益性、安全性、キャッシュフロー）
- 重要イベント一覧と詳細分析
- 総括と注目ポイント

#### 出力先

`./locals/[企業名]_financial_report_YYYYMMDD.md`

## エージェントの追加方法

1. このディレクトリに新しい`.md`ファイルを作成
2. ファイル名がエージェント名になります（例：`my-agent.md` → `subagent_type: my-agent`）
3. エージェントの役割、使用ツール、実行手順を定義
