// チャートのデフォルト設定

export const DEFAULT_CHART_SETTINGS = {
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

// デフォルトコメント生成関数
export const generateDefaultComments = (metrics) => ({
  bs: {
    assets: `流動比率${metrics.currentRatio}% ／ 現金比率${metrics.cashRatio}%`,
    liabilities: `自己資本比率${metrics.equityRatio}%`,
  },
  cf: {
    operating: `営業CFマージン${metrics.operatingCFMargin}% ／ 対純利益比${metrics.cfToNetIncomeRatio}%`,
    investing: null,
    financing: null,
  },
});
