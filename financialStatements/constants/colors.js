// チャート・UIで使用するカラーパレット

export const COLORS = {
  // 損益計算書（P/L）
  pl: {
    売上高: '#3b82f6',
    売上総利益: '#22c55e',
    営業利益: '#8b5cf6',
    経常利益: '#06b6d4',
    当期純利益: '#ec4899',
    売上原価: '#ef4444',
    販管費: '#f97316',
    営業外損益: '#06b6d4',
  },

  // 貸借対照表（B/S）
  bs: {
    // 資産
    現金預金: '#22c55e',
    その他流動資産: '#84cc16',
    有形固定資産: '#3b82f6',
    無形固定資産: '#8b5cf6',
    投資その他: '#06b6d4',
    // 負債
    流動負債: '#ef4444',
    固定負債: '#f97316',
    // 純資産
    純資産: '#10b981',
  },

  // キャッシュフロー（C/F）
  cf: {
    営業CF: '#22c55e',
    投資CF: '#ef4444',
    財務CF: '#f97316',
    フリーCF: '#8b5cf6',
    期首現金: '#6b7280',
    期末現金: '#3b82f6',
  },

  // 共通
  common: {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#6b7280',
  },
};

// B/S積み上げグラフ用の凡例ペイロード
export const BS_LEGEND_PAYLOAD = [
  { value: '現金預金', type: 'square', color: COLORS.bs.現金預金 },
  { value: 'その他流動資産', type: 'square', color: COLORS.bs.その他流動資産 },
  { value: '有形固定資産', type: 'square', color: COLORS.bs.有形固定資産 },
  { value: '無形固定資産', type: 'square', color: COLORS.bs.無形固定資産 },
  { value: '投資その他', type: 'square', color: COLORS.bs.投資その他 },
  { value: '流動負債', type: 'square', color: COLORS.bs.流動負債 },
  { value: '固定負債', type: 'square', color: COLORS.bs.固定負債 },
  { value: '純資産', type: 'square', color: COLORS.bs.純資産 },
];
