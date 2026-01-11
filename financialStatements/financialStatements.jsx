/*
=====================================
Usage Example: Customizing chartSettings
=====================================

// Example settings for large companies (revenue scale: 1 trillion yen)
const largeCompanySettings = {
  chartSettings: {
    pl: {
      domain: [0, 1500000],  // 0 to 1.5 trillion yen
      ticks: [0, 300000, 600000, 900000, 1200000, 1500000],  // Every 300 billion yen
    },
    bs: {
      domain: [0, 2000000],  // 0 to 2 trillion yen
      ticks: [0, 500000, 1000000, 1500000, 2000000],  // Every 500 billion yen
    },
    cf: {
      composition: {
        domain: [-200000, 200000],  // -200 billion to +200 billion yen
        ticks: [-200000, -100000, 0, 100000, 200000],  // Every 100 billion yen
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
  // ... other data
};

// Example settings for small/medium companies (revenue scale: 5 billion yen)
const smallCompanySettings = {
  chartSettings: {
    pl: {
      domain: [0, 6000],  // 0 to 6 billion yen
      ticks: [0, 1000, 2000, 3000, 4000, 5000, 6000],  // Every 1 billion yen
    },
    bs: {
      domain: [0, 4000],  // 0 to 4 billion yen
      ticks: [0, 1000, 2000, 3000, 4000],  // Every 1 billion yen
    },
    cf: {
      composition: {
        domain: [-1000, 1000],  // -1 billion to +1 billion yen
        ticks: [-1000, -500, 0, 500, 1000],  // Every 500 million yen
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
  // ... other data
};

// If chartSettings is omitted, default values will be used

=====================================
Usage Example: Customizing comments
=====================================
// You can customize comments for B/S and C/F sections using comments configuration

const exampleCompanyData = {
  // ... other data

  comments: {
    bs: {
      // null: Default comment (automatically calculates current ratio and cash ratio)
      assets: null,

      // Custom comment
      liabilities: "💡 Equity ratio 45% - Above industry average",
    },
    cf: {
      // null: Default comment (automatically calculates operating CF margin and CF-to-net-income ratio)
      operating: null,

      // Custom comment
      investing: "※ Capital expenditure for new factory construction",

      // false: Hide comment
      financing: false,
    },
  },
};

// Comment configuration values:
// - null or undefined: Display default comment (auto-calculated)
// - string: Display custom comment
// - false: Hide comment

// Default comments:
// - bs.assets: "💡 Current ratio {X}% / Cash ratio {Y}%"
// - bs.liabilities: "💡 Equity ratio {X}%"
// - cf.operating: "💡 Operating CF margin {X}% / CF-to-net-income ratio {Y}%"
// - cf.investing: None
// - cf.financing: None
*/

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, Line, ReferenceLine } from 'recharts';

// =====================================
// Kakiyasu Honten Data
// =====================================
const companyData = {
  name: "株式会社柿安本店",
  code: "2294",
  market: "東証プライム",
  period: "2025年4月期",
  announcementDate: "2025年6月10日",

  // Chart axis settings (specify in million yen units)
  chartSettings: {
    pl: {
      // For P/L structure and 3-period comparison
      domain: [0, 40000],  // 0 to 40,000 million yen (display guide: approx. 0-400 hundred million yen)
      ticks: [0, 10000, 20000, 30000, 40000],  // 10,000 million yen increments (display guide: approx. every 100 hundred million yen)
    },
    bs: {
      // For balance sheet
      domain: [0, 20000],  // 0 to 20,000 million yen (display guide: approx. 0-200 hundred million yen)
      ticks: [0, 5000, 10000, 15000, 20000],  // 5,000 million yen increments (display guide: approx. every 50 hundred million yen)
    },
    cf: {
      // For cash flow composition
      composition: {
        domain: [-4000, 4000],  // -4,000 to +4,000 million yen (display guide: approx. -40 to +40 hundred million yen)
        ticks: [-4000, -2000, 0, 2000, 4000],  // 2,000 million yen increments (display guide: approx. every 20 hundred million yen)
      },
      // For cash change flow
      waterfall: {
        domain: [-4000, 12000],  // -4,000 to +12,000 million yen (display guide: approx. -40 to +120 hundred million yen)
        ticks: [-4000, -2000, 0, 2000, 4000, 6000, 8000, 10000, 12000],  // 2,000 million yen increments (display guide: approx. every 20 hundred million yen)
      },
      // For 3-period cash flow comparison
      comparison: {
        domain: [-4000, 12000],  // -4,000 to +12,000 million yen (display guide: approx. -40 to +120 hundred million yen)
        ticks: [-4000, -2000, 0, 2000, 4000, 6000, 8000, 10000, 12000],  // 2,000 million yen increments (display guide: approx. every 20 hundred million yen)
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
    // Details
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

  // Comment settings (customizable for each section)
  // Default comments will be displayed if null or unspecified
  // Set to false to hide comments
  comments: {
    bs: {
      assets: null,  // null = default (automatically calculates current ratio and cash ratio)
      liabilities: null,  // null = default (displays equity ratio)
    },
    cf: {
      operating: null,  // null = default (automatically calculates operating CF margin and CF-to-net-income ratio)
      investing: "※ One-time expenditure for full acquisition of Akatsuka Kousan",  // Custom comment
      financing: "💡 Debt-free management continues with zero interest-bearing debt",  // Custom comment
    },
  },
};

// =====================================
// Utility Functions
// =====================================
const toOku = (value) => (value / 100).toFixed(0);
const toOkuDecimal = (value) => (value / 100).toFixed(1);
const calcPercent = (part, total) => ((part / total) * 100).toFixed(1);

// =====================================
// Main Component
// =====================================
function FinancialStatements({ companyData }) {
  const [activeTab, setActiveTab] = useState('cf');

  const { name, code, market, period, announcementDate, pl, plComparison, bs, cf, cfComparison, chartSettings, comments } = companyData;

  // Default chart settings (used when chartSettings is not specified)
  const defaultChartSettings = {
    pl: {
      domain: [0, 50000],
      ticks: [0, 10000, 20000, 30000, 40000, 50000],
    },
    bs: {
      domain: [0, 25000],
      ticks: [0, 5000, 10000, 15000, 20000, 25000],
    },
    cf: {
      composition: {
        domain: [-5000, 5000],
        ticks: [-5000, -2500, 0, 2500, 5000],
      },
      waterfall: {
        domain: [-5000, 15000],
        ticks: [-5000, 0, 5000, 10000, 15000],
      },
      comparison: {
        domain: [-5000, 15000],
        ticks: [-5000, 0, 5000, 10000, 15000],
      },
    },
  };

  // Merge chart settings (prioritize specified settings if available)
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

  // B/S metrics calculation
  const currentAssets = bs.assets.現金預金 + bs.assets.その他流動資産;  // Current assets
  const currentRatio = bs.liabilities.流動負債
    ? ((currentAssets / bs.liabilities.流動負債) * 100).toFixed(1)
    : '-';  // Current ratio (placeholder when calculation is not possible)
  const cashRatio = calcPercent(bs.assets.現金預金, totalAssets);  // Cash ratio

  // C/F metrics calculation
  const operatingCFMargin = calcPercent(cf.営業CF.value, pl.売上高.value);  // Operating CF margin
  const cfToNetIncomeRatio = pl.当期純利益.value
    ? ((cf.営業CF.value / pl.当期純利益.value) * 100).toFixed(0)
    : '-';  // CF-to-net-income ratio (placeholder when calculation is not possible)

  // Generate default comments
  const defaultComments = {
    bs: {
      assets: `💡 流動比率${currentRatio}% ／ 現金比率${cashRatio}%`,
      liabilities: `💡 自己資本比率${bs.自己資本比率}%`,
    },
    cf: {
      operating: `💡 営業CFマージン${operatingCFMargin}% ／ 対純利益比${cfToNetIncomeRatio}%`,
      investing: null,
      financing: null,
    },
  };

  // Merge comment settings (prioritize custom comments if available, hide if false)
  const getComment = (section, key) => {
    const customComment = comments?.[section]?.[key];
    if (customComment === false) return null;  // Hide if false
    if (customComment !== null && customComment !== undefined) return customComment;  // Custom comment
    return defaultComments[section]?.[key] || null;  // Default comment
  };

  const plData = [
    { name: '売上高', value: pl.売上高.value, color: '#3b82f6' },
    { name: '売上総利益', value: pl.売上総利益.value, color: '#22c55e' },
    { name: '営業利益', value: pl.営業利益.value, color: '#8b5cf6' },
    { name: '経常利益', value: pl.経常利益.value, color: '#06b6d4' },
    { name: '当期純利益', value: pl.当期純利益.value, color: '#ec4899' },
  ];

  const bsStackedData = [
    { side: '資産の部', ...bs.assets },
    { side: '負債・純資産の部', ...bs.liabilities, ...bs.equity },
  ];

  const individualValues = { ...bs.assets, ...bs.liabilities, ...bs.equity };

  const customLegendPayload = [
    { value: '現金預金', type: 'square', color: '#22c55e' },
    { value: 'その他流動資産', type: 'square', color: '#84cc16' },
    { value: '有形固定資産', type: 'square', color: '#3b82f6' },
    { value: '無形固定資産', type: 'square', color: '#8b5cf6' },
    { value: '投資その他', type: 'square', color: '#06b6d4' },
    { value: '流動負債', type: 'square', color: '#ef4444' },
    { value: '固定負債', type: 'square', color: '#f97316' },
    { value: '純資産', type: 'square', color: '#10b981' },
  ];

  // C/F waterfall chart data
  const cfWaterfallData = [
    { name: '期首現金', value: cf.期首現金残高.value, fill: '#6b7280', type: 'total' },
    { name: '営業CF', value: cf.営業CF.value, fill: '#22c55e', type: 'change' },
    { name: '投資CF', value: cf.投資CF.value, fill: '#ef4444', type: 'change' },
    { name: '財務CF', value: cf.財務CF.value, fill: '#f97316', type: 'change' },
    { name: '期末現金', value: cf.期末現金残高.value, fill: '#3b82f6', type: 'total' },
  ];

  // C/F bar chart data (excluding free CF)
  const cfBarData = [
    { name: '営業CF', value: cf.営業CF.value, color: '#22c55e' },
    { name: '投資CF', value: cf.投資CF.value, color: '#ef4444' },
    { name: '財務CF', value: cf.財務CF.value, color: '#f97316' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.filter(p => p.value > 0).map((entry, index) => (
            <p key={index} style={{ color: entry.fill }} className="text-sm">
              {entry.name}: {toOkuDecimal(entry.value)}億円
            </p>
          ))}
          <p className="text-gray-600 font-semibold mt-2 pt-2 border-t">
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p style={{ color: payload[0]?.fill }} className="text-sm">
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm" style={{ color: value >= 0 ? '#22c55e' : '#ef4444' }}>
            {toOkuDecimal(value)}億円
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomBarLabel = (itemName) => (props) => {
    const { x, y, width, height } = props;
    const value = individualValues[itemName];
    if (height < 25 || !value) return null;
    return (
      <text x={x + width / 2} y={y + height / 2} fill="white" textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="bold">
        {toOku(value)}億
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{name}</h1>
          <p className="text-gray-600">{period} 連結財務諸表</p>
          <p className="text-sm text-gray-500 mt-1">証券コード: {code}（{market}）</p>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button onClick={() => setActiveTab('pl')} className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'pl' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            📊 損益計算書 (P/L)
          </button>
          <button onClick={() => setActiveTab('bs')} className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'bs' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            📈 貸借対照表 (B/S)
          </button>
          <button onClick={() => setActiveTab('cf')} className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'cf' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            💰 C/F計算書 (C/F)
          </button>
        </div>

        {/* P/L Section */}
        {activeTab === 'pl' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
                <p className="text-sm text-gray-500">売上高</p>
                <p className="text-2xl font-bold text-blue-600">{toOku(pl.売上高.value)}億円</p>
                {pl.売上高.yoyChange && <p className={`text-xs ${pl.売上高.yoyChange.startsWith('▲') ? 'text-red-500' : 'text-green-500'}`}>{pl.売上高.yoyChange}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                <p className="text-sm text-gray-500">営業利益</p>
                <p className="text-2xl font-bold text-purple-600">{toOku(pl.営業利益.value)}億円</p>
                {pl.営業利益.yoyChange && <p className={`text-xs ${pl.営業利益.yoyChange.startsWith('▲') ? 'text-red-500' : 'text-green-500'}`}>{pl.営業利益.yoyChange}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-cyan-500">
                <p className="text-sm text-gray-500">経常利益</p>
                <p className="text-2xl font-bold text-cyan-600">{toOkuDecimal(pl.経常利益.value)}億円</p>
                {pl.経常利益.yoyChange && <p className={`text-xs ${pl.経常利益.yoyChange.startsWith('▲') ? 'text-red-500' : 'text-green-500'}`}>{pl.経常利益.yoyChange}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-pink-500">
                <p className="text-sm text-gray-500">当期純利益</p>
                <p className="text-2xl font-bold text-pink-600">{toOku(pl.当期純利益.value)}億円</p>
                {pl.当期純利益.yoyChange && <p className={`text-xs ${pl.当期純利益.yoyChange.startsWith('▲') ? 'text-red-500' : 'text-green-500'}`}>{pl.当期純利益.yoyChange}</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 損益構造（億円）</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={plData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
                    domain={settings.pl.domain}
                    ticks={settings.pl.ticks}
                  />
                  <Tooltip content={<PlTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {plData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {plComparison && plComparison.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📈 {plComparison.length}期業績比較（億円）</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={plComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis
                      tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
                      domain={settings.pl.domain}
                      ticks={settings.pl.ticks}
                    />
                    <Tooltip formatter={(v) => `${toOkuDecimal(v)}億円`} />
                    <Legend />
                    <Bar dataKey="売上高" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="営業利益" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="純利益" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💰 各項目の内訳</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-700 mb-3 text-lg">売上高 {toOku(pl.売上高.value)}億円</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-400 rounded"></span><span>売上原価</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOku(pl.売上原価.value)}億円</span><span className="text-gray-500 ml-2">({calcPercent(pl.売上原価.value, pl.売上高.value)}%)</span></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span><span>売上総利益</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOku(pl.売上総利益.value)}億円</span><span className="text-gray-500 ml-2">({grossProfitMargin}%)</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-bold text-green-700 mb-3 text-lg">売上総利益 {toOku(pl.売上総利益.value)}億円</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-400 rounded"></span><span>販売費及び一般管理費</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOku(pl.販管費.value)}億円</span><span className="text-gray-500 ml-2">({calcPercent(pl.販管費.value, pl.売上総利益.value)}%)</span></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded"></span><span>営業利益</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOku(pl.営業利益.value)}億円</span><span className="text-gray-500 ml-2">({calcPercent(pl.営業利益.value, pl.売上総利益.value)}%)</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <h3 className="font-bold text-cyan-700 mb-3 text-lg">経常利益 {toOkuDecimal(pl.経常利益.value)}億円</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded"></span><span>営業利益</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOku(pl.営業利益.value)}億円</span><span className="text-gray-500 ml-2">({calcPercent(pl.営業利益.value, pl.経常利益.value)}%)</span></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-400 rounded"></span><span>営業外損益</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOkuDecimal(pl.営業外損益.value)}億円</span><span className="text-gray-500 ml-2">({calcPercent(pl.営業外損益.value, pl.経常利益.value)}%)</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-bold text-pink-700 mb-3 text-lg">当期純利益 {toOku(pl.当期純利益.value)}億円</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-500 rounded"></span><span>経常利益</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{toOkuDecimal(pl.経常利益.value)}億円</span></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-400 rounded"></span><span>特別損益・法人税等</span></div>
                      <div className="text-right"><span className="font-mono font-bold">{pl.特別損益等.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(pl.特別損益等.value))}億円</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B/S Section */}
        {activeTab === 'bs' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
                <p className="text-sm text-gray-500">総資産</p>
                <p className="text-2xl font-bold text-blue-600">{toOku(totalAssets)}億円</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
                <p className="text-sm text-gray-500">負債合計</p>
                <p className="text-2xl font-bold text-red-600">{toOku(totalLiabilities)}億円</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                <p className="text-sm text-gray-500">自己資本比率</p>
                <p className="text-2xl font-bold text-purple-600">{bs.自己資本比率}%</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                <p className="text-sm text-gray-500">純資産</p>
                <p className="text-2xl font-bold text-green-600">{toOku(totalEquity)}億円</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-2">⚖️ 貸借対照表（積み上げ図）</h2>
              <p className="text-sm text-gray-500 mb-6">左：資産の部 ／ 右：負債・純資産の部（単位：億円）</p>

              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={bsStackedData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="side" tick={{ fontSize: 14, fontWeight: 'bold' }} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis
                    tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
                    axisLine={{ stroke: '#e5e7eb' }}
                    domain={settings.bs.domain}
                    ticks={settings.bs.ticks}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} iconType="square" payload={customLegendPayload} />

                  <Bar dataKey="投資その他" stackId="stack" fill="#06b6d4" name="投資その他" label={renderCustomBarLabel('投資その他')} />
                  <Bar dataKey="無形固定資産" stackId="stack" fill="#8b5cf6" name="無形固定資産" />
                  <Bar dataKey="有形固定資産" stackId="stack" fill="#3b82f6" name="有形固定資産" label={renderCustomBarLabel('有形固定資産')} />
                  <Bar dataKey="その他流動資産" stackId="stack" fill="#84cc16" name="その他流動資産" label={renderCustomBarLabel('その他流動資産')} />
                  <Bar dataKey="現金預金" stackId="stack" fill="#22c55e" name="現金預金" radius={[4, 4, 0, 0]} label={renderCustomBarLabel('現金預金')} />

                  <Bar dataKey="純資産" stackId="stack" fill="#10b981" name="純資産" label={renderCustomBarLabel('純資産')} />
                  <Bar dataKey="固定負債" stackId="stack" fill="#f97316" name="固定負債" />
                  <Bar dataKey="流動負債" stackId="stack" fill="#ef4444" name="流動負債" radius={[4, 4, 0, 0]} label={renderCustomBarLabel('流動負債')} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-700 mb-2">【資産の部】{toOku(totalAssets)}億円</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span><span>現金預金: {toOku(bs.assets.現金預金)}億円 ({calcPercent(bs.assets.現金預金, totalAssets)}%)</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-lime-500 rounded"></span><span>その他流動資産: {toOku(bs.assets.その他流動資産)}億円 ({calcPercent(bs.assets.その他流動資産, totalAssets)}%)</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded"></span><span>有形固定資産: {toOku(bs.assets.有形固定資産)}億円 ({calcPercent(bs.assets.有形固定資産, totalAssets)}%)</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-violet-500 rounded"></span><span>無形固定資産: {toOku(bs.assets.無形固定資産)}億円 ({calcPercent(bs.assets.無形固定資産, totalAssets)}%)</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-500 rounded"></span><span>投資その他: {toOku(bs.assets.投資その他)}億円 ({calcPercent(bs.assets.投資その他, totalAssets)}%)</span></div>
                  </div>
                  {getComment('bs', 'assets') && (
                    <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                      <p className="text-xs text-blue-700">{getComment('bs', 'assets')}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-bold text-red-700 mb-2">【負債・純資産の部】{toOku(totalAssets)}億円</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded"></span><span>流動負債: {toOku(bs.liabilities.流動負債)}億円 ({calcPercent(bs.liabilities.流動負債, totalAssets)}%)</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded"></span><span>固定負債: {toOkuDecimal(bs.liabilities.固定負債)}億円 ({calcPercent(bs.liabilities.固定負債, totalAssets)}%)</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded"></span><span>純資産: {toOku(bs.equity.純資産)}億円 ({calcPercent(bs.equity.純資産, totalAssets)}%)</span></div>
                  </div>
                  {getComment('bs', 'liabilities') && (
                    <div className="mt-3 p-2 bg-white rounded border border-green-200">
                      <p className="text-xs text-green-700">{getComment('bs', 'liabilities')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C/F Section */}
        {activeTab === 'cf' && (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                <p className="text-sm text-gray-500">営業CF</p>
                <p className="text-2xl font-bold text-green-600">{toOkuDecimal(cf.営業CF.value)}億円</p>
                {cf.営業CF.yoyChange && <p className={`text-xs ${cf.営業CF.yoyChange.startsWith('▲') || cf.営業CF.yoyChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{cf.営業CF.yoyChange}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
                <p className="text-sm text-gray-500">投資CF</p>
                <p className="text-2xl font-bold text-red-600">{cf.投資CF.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(cf.投資CF.value))}億円</p>
                {cf.投資CF.yoyChange && <p className={`text-xs ${cf.投資CF.yoyChange.startsWith('▲') || cf.投資CF.yoyChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{cf.投資CF.yoyChange}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
                <p className="text-sm text-gray-500">財務CF</p>
                <p className="text-2xl font-bold text-orange-600">{cf.財務CF.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(cf.財務CF.value))}億円</p>
                {cf.財務CF.yoyChange && <p className={`text-xs ${cf.財務CF.yoyChange.startsWith('▲') || cf.財務CF.yoyChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{cf.財務CF.yoyChange}</p>}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                <p className="text-sm text-gray-500">フリーCF</p>
                <p className={`text-2xl font-bold ${cf.フリーCF.value >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {cf.フリーCF.value >= 0 ? '' : '▲'}{toOkuDecimal(Math.abs(cf.フリーCF.value))}億円
                </p>
              </div>
            </div>

            {/* C/F Bar Chart - Vertical bar chart */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💰 キャッシュフロー構成（億円）</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cfBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
                    domain={settings.cf.composition.domain}
                    ticks={settings.cf.composition.ticks}
                  />
                  <Tooltip content={<CfTooltip />} />
                  <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                  <ReferenceLine
                    y={cf.フリーCF.value}
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    label={{
                      value: `フリーCF: ${toOkuDecimal(cf.フリーCF.value)}億円`,
                      position: 'right',
                      fill: '#8b5cf6',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {cfBarData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span><span className="text-sm">営業CF</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded"></span><span className="text-sm">投資CF</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded"></span><span className="text-sm">財務CF</span></div>
                <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-purple-500" style={{ borderTop: '3px dashed #8b5cf6' }}></span><span className="text-sm">フリーCF（営業CF+投資CF）</span></div>
              </div>
            </div>

            {/* Cash Flow Waterfall - Bar chart based on 0-line */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 現金増減フロー（億円）</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={[
                    { name: '期首現金', value: cf.期首現金残高.value, fill: '#6b7280' },
                    { name: '営業CF', value: cf.営業CF.value, fill: '#22c55e' },
                    { name: '投資CF', value: cf.投資CF.value, fill: '#ef4444' },
                    { name: '財務CF', value: cf.財務CF.value, fill: '#f97316' },
                    { name: '期末現金', value: cf.期末現金残高.value, fill: '#3b82f6' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
                    domain={settings.cf.waterfall.domain}
                    ticks={settings.cf.waterfall.ticks}
                  />
                  <Tooltip
                    formatter={(v) => [`${toOkuDecimal(v)}億円`, '金額']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  {/* Emphasize 0-line */}
                  <ReferenceLine y={0} stroke="#374151" strokeWidth={2} />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                    {[
                      { name: '期首現金', value: cf.期首現金残高.value, fill: '#6b7280' },
                      { name: '営業CF', value: cf.営業CF.value, fill: '#22c55e' },
                      { name: '投資CF', value: cf.投資CF.value, fill: '#ef4444' },
                      { name: '財務CF', value: cf.財務CF.value, fill: '#f97316' },
                      { name: '期末現金', value: cf.期末現金残高.value, fill: '#3b82f6' },
                    ].map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="text-center text-gray-500 text-sm mt-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">現金増減:</span> {cf.期末現金残高.value - cf.期首現金残高.value >= 0 ? '+' : ''}{toOkuDecimal(cf.期末現金残高.value - cf.期首現金残高.value)}億円
                <span className="mx-2">|</span>
                <span className="text-green-600">営業CF {toOkuDecimal(cf.営業CF.value)}億</span>
                <span className="mx-1">+</span>
                <span className="text-red-600">投資CF {toOkuDecimal(cf.投資CF.value)}億</span>
                <span className="mx-1">+</span>
                <span className="text-orange-600">財務CF {toOkuDecimal(cf.財務CF.value)}億</span>
                <span className="mx-1">=</span>
                <span className="font-bold">{toOkuDecimal(cf.営業CF.value + cf.投資CF.value + cf.財務CF.value)}億</span>
              </div>
            </div>

            {/* 3-Year C/F Comparison */}
            {cfComparison && cfComparison.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📈 {cfComparison.length}期キャッシュフロー比較（億円）</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={cfComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis
                      tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
                      domain={settings.cf.comparison.domain}
                      ticks={settings.cf.comparison.ticks}
                    />
                    <Tooltip formatter={(v) => `${toOkuDecimal(v)}億円`} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                    <Bar dataKey="営業CF" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="投資CF" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="財務CF" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="フリーCF" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="8 4" dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }} />
                    <Line type="monotone" dataKey="期末現金" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* C/F Details */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 キャッシュフロー内訳</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Operating CF details */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-bold text-green-700 mb-3 text-lg flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded"></span>
                    営業CF {toOkuDecimal(cf.営業CF.value)}億円
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>税前利益</span>
                      <span className="font-mono">{toOku(cf.details.営業CF.税前利益)}億円</span>
                    </div>
                    <div className="flex justify-between">
                      <span>減価償却費</span>
                      <span className="font-mono">+{toOku(cf.details.営業CF.減価償却費)}億円</span>
                    </div>
                    <div className="flex justify-between">
                      <span>運転資本増減等</span>
                      <span className="font-mono">+{toOkuDecimal(cf.details.営業CF.運転資本増減)}億円</span>
                    </div>
                  </div>
                  {getComment('cf', 'operating') && (
                    <div className="mt-3 p-2 bg-white rounded border border-green-200">
                      <p className="text-xs text-green-700">{getComment('cf', 'operating')}</p>
                    </div>
                  )}
                </div>

                {/* Investing CF details */}
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-bold text-red-700 mb-3 text-lg flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                    投資CF {toOkuDecimal(cf.投資CF.value)}億円
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>子会社株式取得</span>
                      <span className="font-mono">{toOkuDecimal(cf.details.投資CF.子会社株式取得)}億円</span>
                    </div>
                    <div className="flex justify-between">
                      <span>有形固定資産取得</span>
                      <span className="font-mono">{toOkuDecimal(cf.details.投資CF.有形固定資産取得)}億円</span>
                    </div>
                  </div>
                  {getComment('cf', 'investing') && (
                    <div className="mt-3 p-2 bg-white rounded border border-red-200">
                      <p className="text-xs text-red-700">{getComment('cf', 'investing')}</p>
                    </div>
                  )}
                </div>

                {/* Financing CF details */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-bold text-orange-700 mb-3 text-lg flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded"></span>
                    財務CF {toOkuDecimal(cf.財務CF.value)}億円
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>配当金支払</span>
                      <span className="font-mono">{toOkuDecimal(cf.details.財務CF.配当金支払)}億円</span>
                    </div>
                    <div className="flex justify-between">
                      <span>その他</span>
                      <span className="font-mono">{toOkuDecimal(cf.details.財務CF.その他)}億円</span>
                    </div>
                  </div>
                  {getComment('cf', 'financing') && (
                    <div className="mt-3 p-2 bg-white rounded border border-orange-200">
                      <p className="text-xs text-orange-700">{getComment('cf', 'financing')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>データ出典：{period} 有価証券報告書・決算短信</p>
          <p>決算発表日：{announcementDate}</p>
        </div>
      </div>
    </div>
  );
}

// Pass Kakiyasu Honten data to display
export default function App() {
  return <FinancialStatements companyData={companyData} />;
}
