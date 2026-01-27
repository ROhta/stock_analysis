import React from 'react';
import { useCompanyData } from './hooks/useCompanyData';
import { FinancialStatements } from './financialStatements';

/**
 * アプリケーションエントリーポイント
 * URLパラメータから企業データを読み込み、ローディング・エラー状態を処理
 */
export default function App() {
  const { companyData, loading, error } = useCompanyData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-red-600">エラー: {error}</div>
      </div>
    );
  }

  return <FinancialStatements companyData={companyData} />;
}
