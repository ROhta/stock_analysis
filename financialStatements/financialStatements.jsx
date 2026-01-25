import React, { useState, useMemo, useCallback } from 'react';
import { calcPercent } from './utils/formatters';
import { useChartSettings } from './hooks/useChartSettings';
import { generateDefaultComments } from './constants/defaultSettings';
import { TabButton } from './components/TabButton';
import { PLSection } from './components/PLSection';
import { BSSection } from './components/BSSection';
import { CFSection } from './components/CFSection';

/**
 * 財務諸表メインコンポーネント
 */
export const FinancialStatements = ({ companyData }) => {
  const [activeTab, setActiveTab] = useState('cf');

  const {
    name,
    code,
    market,
    period,
    announcementDate,
    pl,
    plComparison,
    bs,
    cf,
    cfComparison,
    chartSettings,
    comments,
  } = companyData;

  // チャート設定をマージ
  const settings = useChartSettings(chartSettings);

  // B/S・C/F指標の計算
  const metrics = useMemo(() => {
    const totalAssets = Object.values(bs.assets).reduce((sum, v) => sum + v, 0);
    const currentAssets = bs.assets.現金預金 + bs.assets.その他流動資産;
    const currentRatio = ((currentAssets / bs.liabilities.流動負債) * 100).toFixed(1);
    const cashRatio = calcPercent(bs.assets.現金預金, totalAssets);
    const operatingCFMargin = calcPercent(cf.営業CF.value, pl.売上高.value);
    const cfToNetIncomeRatio = ((cf.営業CF.value / pl.当期純利益.value) * 100).toFixed(0);

    return {
      currentRatio,
      cashRatio,
      equityRatio: bs.自己資本比率,
      operatingCFMargin,
      cfToNetIncomeRatio,
    };
  }, [bs, cf, pl]);

  // デフォルトコメント
  const defaultComments = useMemo(() =>
    generateDefaultComments(metrics),
    [metrics]
  );

  // コメント取得関数
  const getComment = useCallback((section, key) => {
    const customComment = comments?.[section]?.[key];
    if (customComment === false) return null;
    if (customComment !== null && customComment !== undefined) return customComment;
    return defaultComments[section]?.[key] || null;
  }, [comments, defaultComments]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{name}</h1>
          <p className="text-gray-600">{period} 連結財務諸表</p>
          <p className="text-sm text-gray-500 mt-1">証券コード: {code}（{market}）</p>
        </div>

        {/* タブ切り替え */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <TabButton
            isActive={activeTab === 'pl'}
            onClick={() => setActiveTab('pl')}
            activeColor="bg-blue-600"
          >
            損益計算書 (P/L)
          </TabButton>
          <TabButton
            isActive={activeTab === 'bs'}
            onClick={() => setActiveTab('bs')}
            activeColor="bg-green-600"
          >
            貸借対照表 (B/S)
          </TabButton>
          <TabButton
            isActive={activeTab === 'cf'}
            onClick={() => setActiveTab('cf')}
            activeColor="bg-purple-600"
          >
            C/F計算書 (C/F)
          </TabButton>
        </div>

        {/* P/L セクション */}
        {activeTab === 'pl' && (
          <PLSection
            pl={pl}
            plComparison={plComparison}
            settings={settings.pl}
          />
        )}

        {/* B/S セクション */}
        {activeTab === 'bs' && (
          <BSSection
            bs={bs}
            settings={settings.bs}
            getComment={getComment}
          />
        )}

        {/* C/F セクション */}
        {activeTab === 'cf' && (
          <CFSection
            cf={cf}
            cfComparison={cfComparison}
            settings={settings.cf}
            getComment={getComment}
          />
        )}

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>データ出典：{period} 有価証券報告書・決算短信</p>
          <p>決算発表日：{announcementDate}</p>
        </div>
      </div>
    </div>
  );
};
