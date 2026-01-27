import React from 'react';

/**
 * 内訳表示用パネルコンポーネント
 */
export const BreakdownPanel = ({
  title,
  bgColor,
  titleColor,
  items,
  comment,
  commentBorderColor = 'border-gray-200',
  commentTextColor = 'text-gray-700',
}) => (
  <div className={`p-4 ${bgColor} rounded-lg`}>
    <h3 className={`font-bold ${titleColor} mb-3 text-lg`}>{title}</h3>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 ${item.dotColor} rounded`}></span>
            <span>{item.label}</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold">{item.value}</span>
            {item.percent && (
              <span className="text-gray-500 ml-2">({item.percent}%)</span>
            )}
          </div>
        </div>
      ))}
    </div>
    {comment && (
      <div className={`mt-3 p-2 bg-white rounded border ${commentBorderColor}`}>
        <p className={`text-xs ${commentTextColor}`}>{comment}</p>
      </div>
    )}
  </div>
);
