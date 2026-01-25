import React from 'react';
import { toOkuDecimal } from '../utils/formatters';

/**
 * P/L用シンプルTooltip
 */
export const PlTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-800">{label}</p>
      <p style={{ color: payload[0]?.fill }} className="text-sm">
        {toOkuDecimal(payload[0]?.value)}億円
      </p>
    </div>
  );
};

/**
 * C/F用Tooltip（正負で色分け）
 */
export const CfTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-sm" style={{ color: value >= 0 ? '#22c55e' : '#ef4444' }}>
        {toOkuDecimal(value)}億円
      </p>
    </div>
  );
};

/**
 * B/S用積み上げグラフTooltip
 * payloadを反転して、グラフ上部から順に表示（資産の部の表示順序と一致）
 */
export const StackedTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // 表示順序を反転（グラフ上部の項目から表示）
  const reversedPayload = [...payload].reverse();

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {reversedPayload.filter(p => p.value > 0).map((entry, index) => (
        <p key={index} style={{ color: entry.fill }} className="text-sm">
          {entry.name}: {toOkuDecimal(entry.value)}億円
        </p>
      ))}
      <p className="text-gray-600 font-semibold mt-2 pt-2 border-t">
        合計: {toOkuDecimal(payload.reduce((sum, p) => sum + (p.value || 0), 0))}億円
      </p>
    </div>
  );
};
