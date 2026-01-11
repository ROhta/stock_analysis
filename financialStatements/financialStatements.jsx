/*
=====================================
使用例：chartSettingsのカスタマイズ
=====================================

// 大企業向け設定例（売上高1兆円規模）
const largeCompanySettings = {
  chartSettings: {
    pl: {
      domain: [0, 1500000],  // 0〜1.5兆円
      ticks: [0, 300000, 600000, 900000, 1200000, 1500000],  // 3000億円ごと
    },
    bs: {
      domain: [0, 2000000],  // 0〜2兆円
      ticks: [0, 500000, 1000000, 1500000, 2000000],  // 5000億円ごと
    },
    cf: {
      composition: {
        domain: [-200000, 200000],  // -2000億〜+2000億円
        ticks: [-200000, -100000, 0, 100000, 200000],  // 1000億円ごと
      },
      waterfall: {
        domain: [-200000, 500000],
        ticks: [-200000, 0, 100000, 200000, 300000, 400000, 500000],
      },
      comparison: {
        domain: [-200000, 500000],
        ticks: [-200000, 0, 100000, 200000, 300000, 400000, 500000],
      },
    },
  },
  // ... 他のデータ
};

// 中小企業向け設定例（売上高50億円規模）
const smallCompanySettings = {
  chartSettings: {
    pl: {
      domain: [0, 6000],  // 0〜60億円
      ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000],  // 10億円ごと
    },
    bs: {
      domain: [0, 4000],  // 0〜40億円
      ticks: [0, 1000, 2000, 3000, 4000],  // 10億円ごと
    },
    cf: {
      composition: {
        domain: [-1000, 1000],  // -10億〜+10億円
        ticks: [-1000, -500, 0, 500, 1000],  // 5億円ごと
      },
      waterfall: {
        domain: [-1000, 2000],
        ticks: [-1000, 0, 500, 1000, 1500, 2000],
      },
      comparison: {
        domain: [-1000, 2000],
        ticks: [-1000, 0, 500, 1000, 1500, 2000],
      },
    },
  },
  // ... 他のデータ
};

// chartSettingsを省略した場合はデフォルト値が使用されます

=====================================
使用例：commentsのカスタマイズ
=====================================
// comments設定でB/SとC/Fのコメントをカスタマイズできます

const exampleCompanyData = {
  // ... 他のデータ

  comments: {
    bs: {
      // null: デフォルトコメント（流動比率・現金比率を自動計算）
      assets: null,

      // カスタムコメント
      liabilities: "💡 自己資本比率45% - 業界平均を上回る水準",
    },
    cf: {
      // null: デフォルトコメント（営業CFマージン・対純利益比を自動計算）
      operating: null,

      // カスタムコメント
      investing: "※新工場建設による設備投資",

      // false: コメントを非表示
      financing: false,
    },
  },
};

// コメント設定の値:
// - null または undefined: デフォルトコメントを表示（自動計算）
// - 文字列: カスタムコメントを表示
// - false: コメントを非表示

// デフォルトコメント:
// - bs.assets: 「💡 流動比率{X}% ／ 現金比率{Y}%」
// - bs.liabilities: 「💡 自己資本比率{X}%」
// - cf.operating: 「💡 営業CFマージン{X}% ／ 対純利益比{Y}%」
// - cf.investing: なし
// - cf.financing: なし
*/

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, Line, ReferenceLine } from 'recharts';

// =====================================
// カラーパレット定義（レトロ田園テーマ）
// =====================================
const colors = {
  // ベース（古写真・羊皮紙風）
  bg: {
    primary: '#f7f3eb',      // 褪せたクリーム
    secondary: '#efe9dc',    // 羊皮紙
    tertiary: '#e6dfd0',     // やや濃いベージュ
    card: '#faf8f3',         // カードの白
    hover: '#f0ebe0',        // ホバー時
    accent: '#d4c8b0',       // アクセント背景
  },
  // テキスト（セピア調）
  text: {
    primary: '#3d3225',      // ダークセピア
    secondary: '#6b5d4d',    // ミディアムセピア
    muted: '#9a8b78',        // ライトセピア
    accent: '#4a3f32',       // アクセントテキスト
  },
  // ボーダー（古びた感じ）
  border: {
    subtle: '#d4c8b0',       // 薄い境界線
    medium: '#b8a990',       // 中間の境界線
    accent: '#a69578',       // アクセント境界線
    dark: '#8c7b66',         // 濃い境界線
  },
  // アクセント（田園風景の色彩 - 褪せた自然色）
  accent: {
    // 草・緑系
    meadow: '#7a9e6d',       // 草原の緑
    meadowMuted: '#5c7a52',  // 深い草の緑
    // 空・青系
    sky: '#7d9eb5',          // 褪せた空色
    skyMuted: '#5d7a8c',     // 薄曇りの空
    // 土・茶系
    earth: '#a67c52',        // 土の茶色
    earthMuted: '#8b6642',   // 深い土色
    // 赤系（古い屋根瓦）
    barn: '#b5756a',         // 納屋の赤
    barnMuted: '#945f55',    // 深い赤茶
    // 黄系（麦畑）
    wheat: '#c9a855',        // 麦の黄金色
    wheatMuted: '#a68a42',   // 熟した麦
    // 紫系（夕暮れ）
    dusk: '#9a7c9e',         // 夕暮れの紫
    duskMuted: '#7a5f7e',    // 深い夕暮れ
    // グレー系（石垣）
    stone: '#8a8577',        // 石の灰色
    stoneMuted: '#6e6a5f',   // 古い石
  },
  // チャート用
  chart: {
    grid: '#d4c8b0',
    axis: '#b8a990',
    reference: '#a69578',
  },
};

// =====================================
// 柿安本店データ
// =====================================
const companyData = {
  name: "株式会社柿安本店",
  code: "2294",
  market: "東証プライム",
  period: "2025年4月期",
  announcementDate: "2025年6月10日",

  // グラフの軸設定（百万円単位で指定）
  chartSettings: {
    pl: {
      // 損益構造・3期比較用
      domain: [0, 40000],  // 0〜400億円
      ticks: [0, 10000, 20000, 30000, 40000],  // 100億円ごと
    },
    bs: {
      // 貸借対照表用
      domain: [0, 20000],  // 0〜200億円
      ticks: [0, 5000, 10000, 15000, 20000],  // 50億円ごと
    },
    cf: {
      // キャッシュフロー構成用
      composition: {
        domain: [-4000, 4000],  // -40億〜+40億円
        ticks: [-4000, -2000, 0, 2000, 4000],  // 20億円ごと
      },
      // 現金増減フロー用
      waterfall: {
        domain: [-4000, 12000],  // -40億〜+120億円
        ticks: [-4000, -2000, 0, 2000, 4000, 6000, 8000, 10000, 12000],  // 20億円ごと
      },
      // 3期キャッシュフロー比較用
      comparison: {
        domain: [-4000, 12000],  // -40億〜+120億円
        ticks: [-4000, -2000, 0, 2000, 4000, 6000, 8000, 10000, 12000],  // 20億円ごと
      },
    },
  },

  pl: {
    売上高: { value: 36104, yoyChange: "▲2.6%" },
    売上原価: { value: 16525 },
    売上総利益: { value: 19579 },
    販管費: { value: 18079 },
    営業利益: { value: 1500, yoyChange: "▲31.8%" },
    経常利益: { value: 1538, yoyChange: "▲31.1%" },
    当期純利益: { value: 701, yoyChange: "▲49.9%" },
    営業外損益: { value: 38 },
    特別損益等: { value: -837 },
  },

  plComparison: [
    { period: '2021年2月期', 売上高: 37289, 営業利益: 1314, 経常利益: 1523, 純利益: 263 },
    { period: '2022年2月期', 売上高: 37998, 営業利益: 2777, 経常利益: 3287, 純利益: 1704 },
    { period: '2023年4月期', 売上高: 35628, 営業利益: 2850, 経常利益: 2860, 純利益: 1889 },
    { period: '2024年4月期', 売上高: 37052, 営業利益: 2200, 経常利益: 2233, 純利益: 1400 },
    { period: '2025年4月期', 売上高: 36104, 営業利益: 1500, 経常利益: 1538, 純利益: 701 },
  ],

  bs: {
    assets: {
      現金預金: 7995,
      その他流動資産: 3535,
      有形固定資産: 5835,
      無形固定資産: 182,
      投資その他: 1649,
    },
    liabilities: {
      流動負債: 4114,
      固定負債: 38,
    },
    equity: {
      純資産: 15044,
    },
    自己資本比率: 78.4,
  },

  cf: {
    営業CF: { value: 1746, yoyChange: "+23.8%" },
    投資CF: { value: -2954, yoyChange: "▲156.5%" },
    財務CF: { value: -905, yoyChange: "▲1.1%" },
    フリーCF: { value: -1208 },
    期首現金残高: { value: 10108 },
    期末現金残高: { value: 7995 },
    // 内訳
    details: {
      営業CF: {
        税前利益: 1100,
        減価償却費: 600,
        運転資本増減: 46,
      },
      投資CF: {
        子会社株式取得: -2381,
        有形固定資産取得: -573,
      },
      財務CF: {
        配当金支払: -890,
        その他: -15,
      },
    },
  },

  cfComparison: [
    { period: '2021年2月期', 営業CF: 1203, 投資CF: -812, 財務CF: -654, フリーCF: 391, 期末現金: 9952 },
    { period: '2022年2月期', 営業CF: 2156, 投資CF: -623, 財務CF: -748, フリーCF: 1533, 期末現金: 10737 },
    { period: '2023年4月期', 営業CF: 2547, 投資CF: -699, 財務CF: -1054, フリーCF: 1848, 期末現金: 10745 },
    { period: '2024年4月期', 営業CF: 1410, 投資CF: -1152, 財務CF: -895, フリーCF: 258, 期末現金: 10108 },
    { period: '2025年4月期', 営業CF: 1746, 投資CF: -2954, 財務CF: -905, フリーCF: -1208, 期末現金: 7995 },
  ],

  // コメント設定（各セクションのコメントをカスタマイズ可能）
  // nullまたは未指定の場合はデフォルトのコメントが表示されます
  // falseを指定するとコメントを非表示にできます
  comments: {
    bs: {
      assets: null,  // null = デフォルト（流動比率・現金比率を自動計算）
      liabilities: null,  // null = デフォルト（自己資本比率を表示）
    },
    cf: {
      operating: null,  // null = デフォルト（営業CFマージン・対純利益比を自動計算）
      investing: "※赤塚興産の完全子会社化による一時的支出",  // カスタムコメント
      financing: "💡 有利子負債ゼロ・無借金経営を継続",  // カスタムコメント
    },
  },
};

// =====================================
// ユーティリティ関数
// =====================================
const toOku = (value) => (value / 100).toFixed(0);
const toOkuDecimal = (value) => (value / 100).toFixed(1);
const calcPercent = (part, total) => ((part / total) * 100).toFixed(1);

// =====================================
// スタイル定義（レトロ田園テーマ）
// =====================================
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.bg.primary,
    padding: '40px 24px',
    fontFamily: 'Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", serif',
    backgroundImage: `
      radial-gradient(ellipse at 20% 30%, rgba(180, 160, 130, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(160, 140, 110, 0.06) 0%, transparent 50%)
    `,
  },
  innerContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    paddingBottom: '32px',
    borderBottom: `2px solid ${colors.border.subtle}`,
    position: 'relative',
  },
  headerDecoration: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '24px',
    color: colors.text.muted,
    letterSpacing: '8px',
  },
  companyName: {
    fontSize: '26px',
    fontWeight: '400',
    color: colors.text.primary,
    letterSpacing: '0.15em',
    marginBottom: '16px',
    fontStyle: 'normal',
  },
  periodText: {
    fontSize: '15px',
    color: colors.text.secondary,
    fontWeight: '400',
    marginBottom: '8px',
    letterSpacing: '0.08em',
  },
  metaText: {
    fontSize: '13px',
    color: colors.text.muted,
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.1em',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  tab: (isActive, accentColor) => ({
    padding: '14px 32px',
    borderRadius: '0',
    fontSize: '14px',
    fontWeight: '400',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    border: `1px solid ${isActive ? colors.border.dark : colors.border.subtle}`,
    borderBottom: isActive ? `3px solid ${accentColor}` : `1px solid ${colors.border.subtle}`,
    backgroundColor: isActive ? colors.bg.card : colors.bg.secondary,
    color: isActive ? colors.text.primary : colors.text.secondary,
    transition: 'all 0.3s ease',
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
    boxShadow: isActive ? '0 2px 8px rgba(100, 80, 60, 0.1)' : 'none',
  }),
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '36px',
  },
  kpiCard: (accentColor) => ({
    backgroundColor: colors.bg.card,
    borderRadius: '0',
    padding: '24px 20px',
    border: `1px solid ${colors.border.subtle}`,
    borderTop: `4px solid ${accentColor}`,
    boxShadow: '0 3px 12px rgba(100, 80, 60, 0.08)',
    position: 'relative',
  }),
  kpiLabel: {
    fontSize: '12px',
    color: colors.text.muted,
    letterSpacing: '0.15em',
    marginBottom: '10px',
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  },
  kpiValue: (color) => ({
    fontSize: '26px',
    fontWeight: '400',
    color: color,
    fontFamily: 'Georgia, "Times New Roman", serif',
  }),
  kpiChange: (isNegative) => ({
    fontSize: '12px',
    color: isNegative ? colors.accent.barn : colors.accent.meadow,
    marginTop: '6px',
    fontFamily: 'Georgia, serif',
  }),
  chartCard: {
    backgroundColor: colors.bg.card,
    borderRadius: '0',
    padding: '32px',
    border: `1px solid ${colors.border.subtle}`,
    marginBottom: '28px',
    boxShadow: '0 4px 16px rgba(100, 80, 60, 0.06)',
    position: 'relative',
  },
  chartCardCorner: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: colors.border.medium,
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '400',
    color: colors.text.primary,
    marginBottom: '28px',
    letterSpacing: '0.1em',
    paddingBottom: '12px',
    borderBottom: `1px solid ${colors.border.subtle}`,
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginTop: '28px',
  },
  detailBox: () => ({
    backgroundColor: colors.bg.secondary,
    borderRadius: '0',
    padding: '24px',
    border: `1px solid ${colors.border.subtle}`,
  }),
  detailTitle: (color) => ({
    fontSize: '15px',
    fontWeight: '400',
    color: color,
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    letterSpacing: '0.05em',
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  }),
  colorDot: (color) => ({
    width: '10px',
    height: '10px',
    borderRadius: '0',
    backgroundColor: color,
    border: `1px solid ${colors.border.medium}`,
  }),
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px dashed ${colors.border.subtle}`,
  },
  detailLabel: {
    fontSize: '14px',
    color: colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  },
  detailValue: {
    fontSize: '14px',
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: colors.text.primary,
  },
  detailPercent: {
    fontSize: '12px',
    color: colors.text.muted,
    marginLeft: '8px',
  },
  commentBox: {
    marginTop: '18px',
    padding: '14px 16px',
    backgroundColor: colors.bg.accent,
    borderRadius: '0',
    borderLeft: `3px solid ${colors.accent.earth}`,
  },
  commentText: {
    fontSize: '13px',
    color: colors.text.secondary,
    lineHeight: '1.7',
    fontStyle: 'italic',
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  },
  footer: {
    marginTop: '56px',
    textAlign: 'center',
    paddingTop: '28px',
    borderTop: `2px solid ${colors.border.subtle}`,
    position: 'relative',
  },
  footerText: {
    fontSize: '12px',
    color: colors.text.muted,
    lineHeight: '2',
    letterSpacing: '0.08em',
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '28px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: `1px dashed ${colors.border.subtle}`,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: colors.text.secondary,
    fontFamily: 'Georgia, "Hiragino Mincho ProN", serif',
  },
  summaryBar: {
    marginTop: '24px',
    padding: '18px 20px',
    backgroundColor: colors.bg.secondary,
    borderRadius: '0',
    textAlign: 'center',
    fontSize: '14px',
    color: colors.text.secondary,
    fontFamily: 'Georgia, "Times New Roman", serif',
    border: `1px solid ${colors.border.subtle}`,
  },
};

// =====================================
// ツールチップコンポーネント
// =====================================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: colors.bg.card,
        padding: '18px',
        border: `1px solid ${colors.border.medium}`,
        borderRadius: '0',
        boxShadow: '0 4px 20px rgba(100, 80, 60, 0.15)',
      }}>
        <p style={{ fontWeight: '400', color: colors.text.primary, marginBottom: '14px', fontSize: '14px', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>{label}</p>
        {payload.filter(p => p.value > 0).map((entry, index) => (
          <p key={index} style={{ color: entry.fill, fontSize: '13px', marginBottom: '6px', fontFamily: 'Georgia, serif' }}>
            {entry.name}: {toOkuDecimal(entry.value)}億円
          </p>
        ))}
        <p style={{ color: colors.text.primary, fontWeight: '400', marginTop: '14px', paddingTop: '14px', borderTop: `1px dashed ${colors.border.subtle}`, fontSize: '13px', fontFamily: 'Georgia, serif' }}>
          合計: {toOkuDecimal(payload.reduce((sum, p) => sum + (p.value || 0), 0))}億円
        </p>
      </div>
    );
  }
  return null;
};

const PlTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: colors.bg.card,
        padding: '18px',
        border: `1px solid ${colors.border.medium}`,
        borderRadius: '0',
        boxShadow: '0 4px 20px rgba(100, 80, 60, 0.15)',
      }}>
        <p style={{ fontWeight: '400', color: colors.text.primary, marginBottom: '10px', fontSize: '14px', fontFamily: 'Georgia, serif' }}>{label}</p>
        <p style={{ color: payload[0]?.fill, fontSize: '16px', fontFamily: 'Georgia, serif' }}>
          {toOkuDecimal(payload[0]?.value)}億円
        </p>
      </div>
    );
  }
  return null;
};

const CfTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value;
    return (
      <div style={{
        backgroundColor: colors.bg.card,
        padding: '18px',
        border: `1px solid ${colors.border.medium}`,
        borderRadius: '0',
        boxShadow: '0 4px 20px rgba(100, 80, 60, 0.15)',
      }}>
        <p style={{ fontWeight: '400', color: colors.text.primary, marginBottom: '10px', fontSize: '14px', fontFamily: 'Georgia, serif' }}>{label}</p>
        <p style={{ fontSize: '16px', fontFamily: 'Georgia, serif', color: value >= 0 ? colors.accent.meadow : colors.accent.barn }}>
          {toOkuDecimal(value)}億円
        </p>
      </div>
    );
  }
  return null;
};

// =====================================
// メインコンポーネント
// =====================================
function FinancialStatements({ companyData }) {
  const [activeTab, setActiveTab] = useState('cf');

  const { name, code, market, period, announcementDate, pl, plComparison, bs, cf, cfComparison, chartSettings, comments } = companyData;

  const defaultChartSettings = {
    pl: { domain: [0, 50000], ticks: [0, 10000, 20000, 30000, 40000, 50000] },
    bs: { domain: [0, 25000], ticks: [0, 5000, 10000, 15000, 20000, 25000] },
    cf: {
      composition: { domain: [-5000, 5000], ticks: [-5000, -2500, 0, 2500, 5000] },
      waterfall: { domain: [-5000, 15000], ticks: [-5000, 0, 5000, 10000, 15000] },
      comparison: { domain: [-5000, 15000], ticks: [-5000, 0, 5000, 10000, 15000] },
    },
  };

  const settings = {
    pl: chartSettings?.pl || defaultChartSettings.pl,
    bs: chartSettings?.bs || defaultChartSettings.bs,
    cf: {
      composition: chartSettings?.cf?.composition || defaultChartSettings.cf.composition,
      waterfall: chartSettings?.cf?.waterfall || defaultChartSettings.cf.waterfall,
      comparison: chartSettings?.cf?.comparison || defaultChartSettings.cf.comparison,
    },
  };

  const totalAssets = Object.values(bs.assets).reduce((sum, v) => sum + v, 0);
  const totalLiabilities = bs.liabilities.流動負債 + bs.liabilities.固定負債;
  const totalEquity = bs.equity.純資産;
  const grossProfitMargin = calcPercent(pl.売上総利益.value, pl.売上高.value);

  const currentAssets = bs.assets.現金預金 + bs.assets.その他流動資産;
  const currentRatio = ((currentAssets / bs.liabilities.流動負債) * 100).toFixed(1);
  const cashRatio = calcPercent(bs.assets.現金預金, totalAssets);

  const operatingCFMargin = calcPercent(cf.営業CF.value, pl.売上高.value);
  const cfToNetIncomeRatio = ((cf.営業CF.value / pl.当期純利益.value) * 100).toFixed(0);

  const defaultComments = {
    bs: {
      assets: `流動比率 ${currentRatio}%　／　現金比率 ${cashRatio}%`,
      liabilities: `自己資本比率 ${bs.自己資本比率}%`,
    },
    cf: {
      operating: `営業CFマージン ${operatingCFMargin}%　／　対純利益比 ${cfToNetIncomeRatio}%`,
      investing: null,
      financing: null,
    },
  };

  const getComment = (section, key) => {
    const customComment = comments?.[section]?.[key];
    if (customComment === false) return null;
    if (customComment !== null && customComment !== undefined) return customComment;
    return defaultComments[section]?.[key] || null;
  };

  // チャートデータ（田園風景カラー）
  const plData = [
    { name: '売上高', value: pl.売上高.value, color: colors.accent.sky },
    { name: '売上総利益', value: pl.売上総利益.value, color: colors.accent.meadow },
    { name: '営業利益', value: pl.営業利益.value, color: colors.accent.dusk },
    { name: '経常利益', value: pl.経常利益.value, color: colors.accent.wheat },
    { name: '当期純利益', value: pl.当期純利益.value, color: colors.accent.barn },
  ];

  const bsStackedData = [
    { side: '資産の部', ...bs.assets },
    { side: '負債・純資産の部', ...bs.liabilities, ...bs.equity },
  ];

  const individualValues = { ...bs.assets, ...bs.liabilities, ...bs.equity };

  const customLegendPayload = [
    { value: '現金預金', type: 'square', color: colors.accent.meadow },
    { value: 'その他流動資産', type: 'square', color: colors.accent.meadowMuted },
    { value: '有形固定資産', type: 'square', color: colors.accent.sky },
    { value: '無形固定資産', type: 'square', color: colors.accent.dusk },
    { value: '投資その他', type: 'square', color: colors.accent.stone },
    { value: '流動負債', type: 'square', color: colors.accent.barn },
    { value: '固定負債', type: 'square', color: colors.accent.barnMuted },
    { value: '純資産', type: 'square', color: colors.accent.wheat },
  ];

  const cfBarData = [
    { name: '営業CF', value: cf.営業CF.value, color: colors.accent.meadow },
    { name: '投資CF', value: cf.投資CF.value, color: colors.accent.barn },
    { name: '財務CF', value: cf.財務CF.value, color: colors.accent.wheat },
  ];

  const renderCustomBarLabel = (itemName) => (props) => {
    const { x, y, width, height } = props;
    const value = individualValues[itemName];
    if (height < 25 || !value) return null;
    return (
      <text x={x + width / 2} y={y + height / 2} fill={colors.text.primary} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="400" style={{ fontFamily: 'Georgia, serif' }}>
        {toOku(value)}億
      </text>
    );
  };

  const tabConfig = {
    pl: { label: '損益計算書', accent: colors.accent.sky },
    bs: { label: '貸借対照表', accent: colors.accent.meadow },
    cf: { label: 'CF計算書', accent: colors.accent.dusk },
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* ヘッダー */}
        <header style={styles.header}>
          <h1 style={styles.companyName}>{name}</h1>
          <p style={styles.periodText}>{period} 連結財務諸表</p>
          <p style={styles.metaText}>証券コード {code}　{market}</p>
        </header>

        {/* タブナビゲーション */}
        <nav style={styles.tabContainer}>
          {Object.entries(tabConfig).map(([key, { label, accent }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={styles.tab(activeTab === key, accent)}
              onMouseEnter={(e) => {
                if (activeTab !== key) {
                  e.target.style.backgroundColor = colors.bg.tertiary;
                  e.target.style.color = colors.text.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== key) {
                  e.target.style.backgroundColor = colors.bg.secondary;
                  e.target.style.color = colors.text.secondary;
                }
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* P/L セクション */}
        {activeTab === 'pl' && (
          <div>
            <div style={{ ...styles.kpiGrid, gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div style={styles.kpiCard(colors.accent.sky)}>
                <p style={styles.kpiLabel}>売上高</p>
                <p style={styles.kpiValue(colors.accent.sky)}>{toOku(pl.売上高.value)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {pl.売上高.yoyChange && <p style={styles.kpiChange(pl.売上高.yoyChange.startsWith('▲'))}>{pl.売上高.yoyChange}</p>}
              </div>
              <div style={styles.kpiCard(colors.accent.dusk)}>
                <p style={styles.kpiLabel}>営業利益</p>
                <p style={styles.kpiValue(colors.accent.dusk)}>{toOku(pl.営業利益.value)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {pl.営業利益.yoyChange && <p style={styles.kpiChange(pl.営業利益.yoyChange.startsWith('▲'))}>{pl.営業利益.yoyChange}</p>}
              </div>
              <div style={styles.kpiCard(colors.accent.wheat)}>
                <p style={styles.kpiLabel}>経常利益</p>
                <p style={styles.kpiValue(colors.accent.wheat)}>{toOkuDecimal(pl.経常利益.value)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {pl.経常利益.yoyChange && <p style={styles.kpiChange(pl.経常利益.yoyChange.startsWith('▲'))}>{pl.経常利益.yoyChange}</p>}
              </div>
              <div style={styles.kpiCard(colors.accent.barn)}>
                <p style={styles.kpiLabel}>当期純利益</p>
                <p style={styles.kpiValue(colors.accent.barn)}>{toOku(pl.当期純利益.value)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {pl.当期純利益.yoyChange && <p style={styles.kpiChange(pl.当期純利益.yoyChange.startsWith('▲'))}>{pl.当期純利益.yoyChange}</p>}
              </div>
            </div>

            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>損益構造</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={plData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: colors.text.secondary, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v/100).toFixed(0)}億`} tick={{ fontSize: 12, fill: colors.text.muted, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} domain={settings.pl.domain} ticks={settings.pl.ticks} />
                  <Tooltip content={<PlTooltip />} cursor={{ fill: colors.bg.hover }} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {plData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {plComparison && plComparison.length > 0 && (
              <div style={styles.chartCard}>
                <h2 style={styles.chartTitle}>{plComparison.length}期業績比較</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={plComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: colors.text.secondary, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v/100).toFixed(0)}億`} tick={{ fontSize: 12, fill: colors.text.muted, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} domain={settings.pl.domain} ticks={settings.pl.ticks} />
                    <Tooltip formatter={(v) => `${toOkuDecimal(v)}億円`} contentStyle={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border.medium}`, borderRadius: '0' }} labelStyle={{ color: colors.text.primary, fontFamily: 'Georgia, serif' }} />
                    <Legend wrapperStyle={{ paddingTop: 16 }} iconType="square" formatter={(value) => <span style={{ color: colors.text.secondary, fontSize: '12px', fontFamily: 'Georgia, serif' }}>{value}</span>} />
                    <Bar dataKey="売上高" fill={colors.accent.sky} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="営業利益" fill={colors.accent.dusk} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="純利益" fill={colors.accent.barn} radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>各項目の内訳</h2>
              <div style={styles.detailGrid}>
                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.sky)}>
                    <span style={styles.colorDot(colors.accent.sky)}></span>
                    売上高 {toOku(pl.売上高.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.barn)}></span>売上原価</span>
                    <span><span style={styles.detailValue}>{toOku(pl.売上原価.value)}億円</span><span style={styles.detailPercent}>({calcPercent(pl.売上原価.value, pl.売上高.value)}%)</span></span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.meadow)}></span>売上総利益</span>
                    <span><span style={styles.detailValue}>{toOku(pl.売上総利益.value)}億円</span><span style={styles.detailPercent}>({grossProfitMargin}%)</span></span>
                  </div>
                </div>

                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.meadow)}>
                    <span style={styles.colorDot(colors.accent.meadow)}></span>
                    売上総利益 {toOku(pl.売上総利益.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.wheat)}></span>販管費</span>
                    <span><span style={styles.detailValue}>{toOku(pl.販管費.value)}億円</span><span style={styles.detailPercent}>({calcPercent(pl.販管費.value, pl.売上総利益.value)}%)</span></span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.dusk)}></span>営業利益</span>
                    <span><span style={styles.detailValue}>{toOku(pl.営業利益.value)}億円</span><span style={styles.detailPercent}>({calcPercent(pl.営業利益.value, pl.売上総利益.value)}%)</span></span>
                  </div>
                </div>

                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.wheat)}>
                    <span style={styles.colorDot(colors.accent.wheat)}></span>
                    経常利益 {toOkuDecimal(pl.経常利益.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.dusk)}></span>営業利益</span>
                    <span style={styles.detailValue}>{toOku(pl.営業利益.value)}億円</span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.stone)}></span>営業外損益</span>
                    <span style={styles.detailValue}>{toOkuDecimal(pl.営業外損益.value)}億円</span>
                  </div>
                </div>

                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.barn)}>
                    <span style={styles.colorDot(colors.accent.barn)}></span>
                    当期純利益 {toOku(pl.当期純利益.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.wheat)}></span>経常利益</span>
                    <span style={styles.detailValue}>{toOkuDecimal(pl.経常利益.value)}億円</span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.stone)}></span>特別損益・税</span>
                    <span style={styles.detailValue}>{pl.特別損益等.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(pl.特別損益等.value))}億円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B/S セクション */}
        {activeTab === 'bs' && (
          <div>
            <div style={{ ...styles.kpiGrid, gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div style={styles.kpiCard(colors.accent.sky)}>
                <p style={styles.kpiLabel}>総資産</p>
                <p style={styles.kpiValue(colors.accent.sky)}>{toOku(totalAssets)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
              </div>
              <div style={styles.kpiCard(colors.accent.barn)}>
                <p style={styles.kpiLabel}>負債合計</p>
                <p style={styles.kpiValue(colors.accent.barn)}>{toOku(totalLiabilities)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
              </div>
              <div style={styles.kpiCard(colors.accent.dusk)}>
                <p style={styles.kpiLabel}>自己資本比率</p>
                <p style={styles.kpiValue(colors.accent.dusk)}>{bs.自己資本比率}<span style={{ fontSize: '14px', marginLeft: '4px' }}>%</span></p>
              </div>
              <div style={styles.kpiCard(colors.accent.wheat)}>
                <p style={styles.kpiLabel}>純資産</p>
                <p style={styles.kpiValue(colors.accent.wheat)}>{toOku(totalEquity)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
              </div>
            </div>

            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>貸借対照表（積み上げ図）</h2>
              <p style={{ fontSize: '13px', color: colors.text.muted, marginBottom: '24px', marginTop: '-16px', fontFamily: 'Georgia, serif' }}>左：資産の部　／　右：負債・純資産の部</p>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={bsStackedData} barCategoryGap="30%" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} vertical={false} />
                  <XAxis dataKey="side" tick={{ fontSize: 13, fill: colors.text.secondary, fontWeight: '400', fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v/100).toFixed(0)}億`} tick={{ fontSize: 12, fill: colors.text.muted, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} domain={settings.bs.domain} ticks={settings.bs.ticks} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.bg.hover }} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} iconType="square" payload={customLegendPayload} formatter={(value) => <span style={{ color: colors.text.secondary, fontSize: '11px', fontFamily: 'Georgia, serif' }}>{value}</span>} />

                  <Bar dataKey="投資その他" stackId="stack" fill={colors.accent.stone} name="投資その他" label={renderCustomBarLabel('投資その他')} />
                  <Bar dataKey="無形固定資産" stackId="stack" fill={colors.accent.dusk} name="無形固定資産" />
                  <Bar dataKey="有形固定資産" stackId="stack" fill={colors.accent.sky} name="有形固定資産" label={renderCustomBarLabel('有形固定資産')} />
                  <Bar dataKey="その他流動資産" stackId="stack" fill={colors.accent.meadowMuted} name="その他流動資産" label={renderCustomBarLabel('その他流動資産')} />
                  <Bar dataKey="現金預金" stackId="stack" fill={colors.accent.meadow} name="現金預金" radius={[0, 0, 0, 0]} label={renderCustomBarLabel('現金預金')} />

                  <Bar dataKey="純資産" stackId="stack" fill={colors.accent.wheat} name="純資産" label={renderCustomBarLabel('純資産')} />
                  <Bar dataKey="固定負債" stackId="stack" fill={colors.accent.barnMuted} name="固定負債" />
                  <Bar dataKey="流動負債" stackId="stack" fill={colors.accent.barn} name="流動負債" radius={[0, 0, 0, 0]} label={renderCustomBarLabel('流動負債')} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ ...styles.detailGrid, marginTop: '32px' }}>
                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.sky)}>
                    <span style={styles.colorDot(colors.accent.sky)}></span>
                    資産の部 {toOku(totalAssets)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.meadow)}></span>現金預金</span>
                    <span><span style={styles.detailValue}>{toOku(bs.assets.現金預金)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.assets.現金預金, totalAssets)}%)</span></span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.meadowMuted)}></span>その他流動資産</span>
                    <span><span style={styles.detailValue}>{toOku(bs.assets.その他流動資産)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.assets.その他流動資産, totalAssets)}%)</span></span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.sky)}></span>有形固定資産</span>
                    <span><span style={styles.detailValue}>{toOku(bs.assets.有形固定資産)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.assets.有形固定資産, totalAssets)}%)</span></span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.dusk)}></span>無形固定資産</span>
                    <span><span style={styles.detailValue}>{toOku(bs.assets.無形固定資産)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.assets.無形固定資産, totalAssets)}%)</span></span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.stone)}></span>投資その他</span>
                    <span><span style={styles.detailValue}>{toOku(bs.assets.投資その他)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.assets.投資その他, totalAssets)}%)</span></span>
                  </div>
                  {getComment('bs', 'assets') && (
                    <div style={styles.commentBox}>
                      <p style={styles.commentText}>{getComment('bs', 'assets')}</p>
                    </div>
                  )}
                </div>

                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.barn)}>
                    <span style={styles.colorDot(colors.accent.barn)}></span>
                    負債・純資産の部 {toOku(totalAssets)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.barn)}></span>流動負債</span>
                    <span><span style={styles.detailValue}>{toOku(bs.liabilities.流動負債)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.liabilities.流動負債, totalAssets)}%)</span></span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.barnMuted)}></span>固定負債</span>
                    <span><span style={styles.detailValue}>{toOkuDecimal(bs.liabilities.固定負債)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.liabilities.固定負債, totalAssets)}%)</span></span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}><span style={styles.colorDot(colors.accent.wheat)}></span>純資産</span>
                    <span><span style={styles.detailValue}>{toOku(bs.equity.純資産)}億円</span><span style={styles.detailPercent}>({calcPercent(bs.equity.純資産, totalAssets)}%)</span></span>
                  </div>
                  {getComment('bs', 'liabilities') && (
                    <div style={styles.commentBox}>
                      <p style={styles.commentText}>{getComment('bs', 'liabilities')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C/F セクション */}
        {activeTab === 'cf' && (
          <div>
            <div style={{ ...styles.kpiGrid, gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div style={styles.kpiCard(colors.accent.meadow)}>
                <p style={styles.kpiLabel}>営業CF</p>
                <p style={styles.kpiValue(colors.accent.meadow)}>{toOkuDecimal(cf.営業CF.value)}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {cf.営業CF.yoyChange && <p style={styles.kpiChange(cf.営業CF.yoyChange.startsWith('▲') || cf.営業CF.yoyChange.startsWith('-'))}>{cf.営業CF.yoyChange}</p>}
              </div>
              <div style={styles.kpiCard(colors.accent.barn)}>
                <p style={styles.kpiLabel}>投資CF</p>
                <p style={styles.kpiValue(colors.accent.barn)}>{cf.投資CF.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(cf.投資CF.value))}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {cf.投資CF.yoyChange && <p style={styles.kpiChange(cf.投資CF.yoyChange.startsWith('▲') || cf.投資CF.yoyChange.startsWith('-'))}>{cf.投資CF.yoyChange}</p>}
              </div>
              <div style={styles.kpiCard(colors.accent.wheat)}>
                <p style={styles.kpiLabel}>財務CF</p>
                <p style={styles.kpiValue(colors.accent.wheat)}>{cf.財務CF.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(cf.財務CF.value))}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span></p>
                {cf.財務CF.yoyChange && <p style={styles.kpiChange(cf.財務CF.yoyChange.startsWith('▲') || cf.財務CF.yoyChange.startsWith('-'))}>{cf.財務CF.yoyChange}</p>}
              </div>
              <div style={styles.kpiCard(colors.accent.dusk)}>
                <p style={styles.kpiLabel}>フリーCF</p>
                <p style={styles.kpiValue(cf.フリーCF.value >= 0 ? colors.accent.dusk : colors.accent.barn)}>
                  {cf.フリーCF.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(cf.フリーCF.value))}<span style={{ fontSize: '14px', marginLeft: '4px' }}>億円</span>
                </p>
              </div>
            </div>

            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>キャッシュフロー構成</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cfBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: colors.text.secondary, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v/100).toFixed(0)}億`} tick={{ fontSize: 12, fill: colors.text.muted, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} domain={settings.cf.composition.domain} ticks={settings.cf.composition.ticks} />
                  <Tooltip content={<CfTooltip />} cursor={{ fill: colors.bg.hover }} />
                  <ReferenceLine y={0} stroke={colors.chart.reference} strokeWidth={1} />
                  <ReferenceLine y={cf.フリーCF.value} stroke={colors.accent.dusk} strokeWidth={2} strokeDasharray="8 4" label={{ value: `フリーCF: ${toOkuDecimal(cf.フリーCF.value)}億円`, position: 'right', fill: colors.accent.dusk, fontSize: 12, fontFamily: 'Georgia, serif' }} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {cfBarData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={styles.legendContainer}>
                <div style={styles.legendItem}><span style={styles.colorDot(colors.accent.meadow)}></span>営業CF</div>
                <div style={styles.legendItem}><span style={styles.colorDot(colors.accent.barn)}></span>投資CF</div>
                <div style={styles.legendItem}><span style={styles.colorDot(colors.accent.wheat)}></span>財務CF</div>
                <div style={styles.legendItem}><span style={{ width: '20px', height: '2px', backgroundColor: colors.accent.dusk, borderTop: '2px dashed' }}></span>フリーCF</div>
              </div>
            </div>

            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>現金増減フロー</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={[
                    { name: '期首現金', value: cf.期首現金残高.value, fill: colors.accent.stone },
                    { name: '営業CF', value: cf.営業CF.value, fill: colors.accent.meadow },
                    { name: '投資CF', value: cf.投資CF.value, fill: colors.accent.barn },
                    { name: '財務CF', value: cf.財務CF.value, fill: colors.accent.wheat },
                    { name: '期末現金', value: cf.期末現金残高.value, fill: colors.accent.sky },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: colors.text.secondary, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v/100).toFixed(0)}億`} tick={{ fontSize: 12, fill: colors.text.muted, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} domain={settings.cf.waterfall.domain} ticks={settings.cf.waterfall.ticks} />
                  <Tooltip formatter={(v) => [`${toOkuDecimal(v)}億円`, '金額']} contentStyle={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border.medium}`, borderRadius: '0' }} labelStyle={{ color: colors.text.primary, fontFamily: 'Georgia, serif' }} />
                  <ReferenceLine y={0} stroke={colors.chart.reference} strokeWidth={2} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {[
                      { name: '期首現金', fill: colors.accent.stone },
                      { name: '営業CF', fill: colors.accent.meadow },
                      { name: '投資CF', fill: colors.accent.barn },
                      { name: '財務CF', fill: colors.accent.wheat },
                      { name: '期末現金', fill: colors.accent.sky },
                    ].map((entry, index) => (<Cell key={index} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={styles.summaryBar}>
                <span style={{ fontWeight: '400', color: colors.text.primary }}>現金増減：</span>
                {cf.期末現金残高.value - cf.期首現金残高.value >= 0 ? '+' : ''}{toOkuDecimal(cf.期末現金残高.value - cf.期首現金残高.value)}億円
                <span style={{ margin: '0 16px', color: colors.border.medium }}>｜</span>
                <span style={{ color: colors.accent.meadow }}>営業CF {toOkuDecimal(cf.営業CF.value)}億</span>
                <span style={{ color: colors.text.muted }}> ＋ </span>
                <span style={{ color: colors.accent.barn }}>投資CF {toOkuDecimal(cf.投資CF.value)}億</span>
                <span style={{ color: colors.text.muted }}> ＋ </span>
                <span style={{ color: colors.accent.wheat }}>財務CF {toOkuDecimal(cf.財務CF.value)}億</span>
                <span style={{ color: colors.text.muted }}> ＝ </span>
                <span style={{ fontWeight: '400', color: colors.text.primary }}>{toOkuDecimal(cf.営業CF.value + cf.投資CF.value + cf.財務CF.value)}億</span>
              </div>
            </div>

            {cfComparison && cfComparison.length > 0 && (
              <div style={styles.chartCard}>
                <h2 style={styles.chartTitle}>{cfComparison.length}期キャッシュフロー比較</h2>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={cfComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: colors.text.secondary, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v/100).toFixed(0)}億`} tick={{ fontSize: 12, fill: colors.text.muted, fontFamily: 'Georgia, serif' }} axisLine={{ stroke: colors.chart.axis }} tickLine={false} domain={settings.cf.comparison.domain} ticks={settings.cf.comparison.ticks} />
                    <Tooltip formatter={(v) => `${toOkuDecimal(v)}億円`} contentStyle={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border.medium}`, borderRadius: '0' }} labelStyle={{ color: colors.text.primary, fontFamily: 'Georgia, serif' }} />
                    <Legend wrapperStyle={{ paddingTop: 16 }} iconType="square" formatter={(value) => <span style={{ color: colors.text.secondary, fontSize: '11px', fontFamily: 'Georgia, serif' }}>{value}</span>} />
                    <ReferenceLine y={0} stroke={colors.chart.reference} strokeWidth={1} />
                    <Bar dataKey="営業CF" fill={colors.accent.meadow} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="投資CF" fill={colors.accent.barn} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="財務CF" fill={colors.accent.wheat} radius={[0, 0, 0, 0]} />
                    <Line type="monotone" dataKey="フリーCF" stroke={colors.accent.dusk} strokeWidth={2} strokeDasharray="8 4" dot={{ fill: colors.accent.dusk, strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="期末現金" stroke={colors.accent.sky} strokeWidth={2} dot={{ fill: colors.accent.sky, strokeWidth: 2, r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>キャッシュフロー内訳</h2>
              <div style={{ ...styles.detailGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.meadow)}>
                    <span style={styles.colorDot(colors.accent.meadow)}></span>
                    営業CF {toOkuDecimal(cf.営業CF.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>税前利益</span>
                    <span style={styles.detailValue}>{toOku(cf.details.営業CF.税前利益)}億円</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>減価償却費</span>
                    <span style={styles.detailValue}>+{toOku(cf.details.営業CF.減価償却費)}億円</span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}>運転資本増減等</span>
                    <span style={styles.detailValue}>+{toOkuDecimal(cf.details.営業CF.運転資本増減)}億円</span>
                  </div>
                  {getComment('cf', 'operating') && (
                    <div style={styles.commentBox}>
                      <p style={styles.commentText}>{getComment('cf', 'operating')}</p>
                    </div>
                  )}
                </div>

                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.barn)}>
                    <span style={styles.colorDot(colors.accent.barn)}></span>
                    投資CF {toOkuDecimal(cf.投資CF.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>子会社株式取得</span>
                    <span style={styles.detailValue}>{toOkuDecimal(cf.details.投資CF.子会社株式取得)}億円</span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}>有形固定資産取得</span>
                    <span style={styles.detailValue}>{toOkuDecimal(cf.details.投資CF.有形固定資産取得)}億円</span>
                  </div>
                  {getComment('cf', 'investing') && (
                    <div style={styles.commentBox}>
                      <p style={styles.commentText}>{getComment('cf', 'investing')}</p>
                    </div>
                  )}
                </div>

                <div style={styles.detailBox()}>
                  <h3 style={styles.detailTitle(colors.accent.wheat)}>
                    <span style={styles.colorDot(colors.accent.wheat)}></span>
                    財務CF {toOkuDecimal(cf.財務CF.value)}億円
                  </h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>配当金支払</span>
                    <span style={styles.detailValue}>{toOkuDecimal(cf.details.財務CF.配当金支払)}億円</span>
                  </div>
                  <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                    <span style={styles.detailLabel}>その他</span>
                    <span style={styles.detailValue}>{toOkuDecimal(cf.details.財務CF.その他)}億円</span>
                  </div>
                  {getComment('cf', 'financing') && (
                    <div style={styles.commentBox}>
                      <p style={styles.commentText}>{getComment('cf', 'financing')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            データ出典：{period} 有価証券報告書・決算短信<br />
            決算発表日：{announcementDate}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return <FinancialStatements companyData={companyData} />;
}
