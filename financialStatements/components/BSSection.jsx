import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toOku, toOkuDecimal, calcPercent } from '../utils/formatters';
import { COLORS, BS_LEGEND_PAYLOAD } from '../constants/colors';
import { MetricCard } from './MetricCard';
import { BreakdownPanel } from './BreakdownPanel';
import { StackedTooltip } from './ChartTooltip';

/**
 * 貸借対照表（B/S）セクション
 */
export const BSSection = ({ bs, settings, getComment }) => {
  // 合計値を計算
  const totalAssets = useMemo(() =>
    Object.values(bs.assets).reduce((sum, v) => sum + v, 0),
    [bs.assets]
  );
  const totalLiabilities = bs.liabilities.流動負債 + bs.liabilities.固定負債;
  const totalEquity = bs.equity.純資産;

  // 積み上げグラフ用データをメモ化
  const bsStackedData = useMemo(() => [
    { side: '資産の部', ...bs.assets },
    { side: '負債・純資産の部', ...bs.liabilities, ...bs.equity },
  ], [bs]);

  // ラベル用の個別値
  const individualValues = useMemo(() =>
    ({ ...bs.assets, ...bs.liabilities, ...bs.equity }),
    [bs]
  );

  // 棒グラフ内ラベル描画関数
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
    <div className="space-y-8">
      {/* メトリクスカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="総資産"
          value={toOku(totalAssets)}
          borderColor="border-blue-500"
          textColor="text-blue-600"
        />
        <MetricCard
          label="負債合計"
          value={toOku(totalLiabilities)}
          borderColor="border-red-500"
          textColor="text-red-600"
        />
        <MetricCard
          label="自己資本比率"
          value={bs.自己資本比率}
          unit="%"
          borderColor="border-purple-500"
          textColor="text-purple-600"
        />
        <MetricCard
          label="純資産"
          value={toOku(totalEquity)}
          borderColor="border-green-500"
          textColor="text-green-600"
        />
      </div>

      {/* B/S積み上げチャート */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-2">貸借対照表（積み上げ図）</h2>
        <p className="text-sm text-gray-500 mb-6">左：資産の部 ／ 右：負債・純資産の部（単位：億円）</p>

        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={bsStackedData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="side" tick={{ fontSize: 14, fontWeight: 'bold' }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis
              tickFormatter={(v) => `${(v/100).toFixed(0)}億`}
              axisLine={{ stroke: '#e5e7eb' }}
              domain={settings.domain}
              ticks={settings.ticks}
            />
            <Tooltip content={<StackedTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 20 }} iconType="square" payload={BS_LEGEND_PAYLOAD} />

            <Bar dataKey="投資その他" stackId="stack" fill={COLORS.bs.投資その他} name="投資その他" label={renderCustomBarLabel('投資その他')} />
            <Bar dataKey="無形固定資産" stackId="stack" fill={COLORS.bs.無形固定資産} name="無形固定資産" />
            <Bar dataKey="有形固定資産" stackId="stack" fill={COLORS.bs.有形固定資産} name="有形固定資産" label={renderCustomBarLabel('有形固定資産')} />
            <Bar dataKey="その他流動資産" stackId="stack" fill={COLORS.bs.その他流動資産} name="その他流動資産" label={renderCustomBarLabel('その他流動資産')} />
            <Bar dataKey="現金預金" stackId="stack" fill={COLORS.bs.現金預金} name="現金預金" radius={[4, 4, 0, 0]} label={renderCustomBarLabel('現金預金')} />

            <Bar dataKey="純資産" stackId="stack" fill={COLORS.bs.純資産} name="純資産" label={renderCustomBarLabel('純資産')} />
            <Bar dataKey="固定負債" stackId="stack" fill={COLORS.bs.固定負債} name="固定負債" />
            <Bar dataKey="流動負債" stackId="stack" fill={COLORS.bs.流動負債} name="流動負債" radius={[4, 4, 0, 0]} label={renderCustomBarLabel('流動負債')} />
          </BarChart>
        </ResponsiveContainer>

        {/* 内訳パネル */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <BreakdownPanel
            title={`【資産の部】${toOku(totalAssets)}億円`}
            bgColor="bg-blue-50"
            titleColor="text-blue-700"
            items={[
              { dotColor: 'bg-green-500', label: '現金預金', value: `${toOku(bs.assets.現金預金)}億円`, percent: calcPercent(bs.assets.現金預金, totalAssets) },
              { dotColor: 'bg-lime-500', label: 'その他流動資産', value: `${toOku(bs.assets.その他流動資産)}億円`, percent: calcPercent(bs.assets.その他流動資産, totalAssets) },
              { dotColor: 'bg-blue-500', label: '有形固定資産', value: `${toOku(bs.assets.有形固定資産)}億円`, percent: calcPercent(bs.assets.有形固定資産, totalAssets) },
              { dotColor: 'bg-violet-500', label: '無形固定資産', value: `${toOku(bs.assets.無形固定資産)}億円`, percent: calcPercent(bs.assets.無形固定資産, totalAssets) },
              { dotColor: 'bg-cyan-500', label: '投資その他', value: `${toOku(bs.assets.投資その他)}億円`, percent: calcPercent(bs.assets.投資その他, totalAssets) },
            ]}
            comment={getComment('bs', 'assets')}
            commentBorderColor="border-blue-200"
            commentTextColor="text-blue-700"
          />
          <BreakdownPanel
            title={`【負債・純資産の部】${toOku(totalAssets)}億円`}
            bgColor="bg-red-50"
            titleColor="text-red-700"
            items={[
              { dotColor: 'bg-red-500', label: '流動負債', value: `${toOku(bs.liabilities.流動負債)}億円`, percent: calcPercent(bs.liabilities.流動負債, totalAssets) },
              { dotColor: 'bg-orange-500', label: '固定負債', value: `${toOkuDecimal(bs.liabilities.固定負債)}億円`, percent: calcPercent(bs.liabilities.固定負債, totalAssets) },
              { dotColor: 'bg-emerald-500', label: '純資産', value: `${toOku(bs.equity.純資産)}億円`, percent: calcPercent(bs.equity.純資産, totalAssets) },
            ]}
            comment={getComment('bs', 'liabilities')}
            commentBorderColor="border-green-200"
            commentTextColor="text-green-700"
          />
        </div>
      </div>
    </div>
  );
};
