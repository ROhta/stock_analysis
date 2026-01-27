import React from 'react';
import { isNegativeChange } from '../utils/formatters';

/**
 * メトリクス表示用共通カード
 */
export const MetricCard = ({
  label,
  value,
  unit = '億円',
  borderColor,
  textColor,
  yoyChange,
}) => (
  <div className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${borderColor}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-2xl font-bold ${textColor}`}>
      {value}{unit}
    </p>
    {yoyChange && (
      <p className={`text-xs ${isNegativeChange(yoyChange) ? 'text-red-500' : 'text-green-500'}`}>
        {yoyChange}
      </p>
    )}
  </div>
);
