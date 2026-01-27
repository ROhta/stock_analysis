import { useState, useEffect } from 'react';

/**
 * URLパラメータから企業データを読み込むカスタムフック
 * @returns {{ companyData: object|null, loading: boolean, error: string|null }}
 */
export const useCompanyData = () => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataFile = params.get('companyData');

    if (!dataFile) {
      setError('404: companyDataパラメータが指定されていません');
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.BASE_URL}${dataFile}.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`404: ${dataFile}.json が見つかりません`);
        }
        return response.json();
      })
      .then((data) => {
        setCompanyData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { companyData, loading, error };
};
