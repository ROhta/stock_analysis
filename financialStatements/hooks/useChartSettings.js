import { useMemo } from 'react';
import { DEFAULT_CHART_SETTINGS } from '../constants/defaultSettings';

/**
 * チャート設定をマージするカスタムフック
 * カスタム設定があればそちらを優先、なければデフォルト設定を使用
 * @param {object} chartSettings - カスタムチャート設定
 * @returns {object} マージされたチャート設定
 */
export const useChartSettings = (chartSettings) => {
  return useMemo(() => ({
    pl: chartSettings?.pl || DEFAULT_CHART_SETTINGS.pl,
    bs: chartSettings?.bs || DEFAULT_CHART_SETTINGS.bs,
    cf: {
      composition: chartSettings?.cf?.composition || DEFAULT_CHART_SETTINGS.cf.composition,
      waterfall: chartSettings?.cf?.waterfall || DEFAULT_CHART_SETTINGS.cf.waterfall,
      comparison: chartSettings?.cf?.comparison || DEFAULT_CHART_SETTINGS.cf.comparison,
    },
  }), [chartSettings]);
};
