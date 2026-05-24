import { useState, useMemo } from 'react';
import { Stock } from '../types';
import { MOCK_STOCKS, findStockByCode } from '../data';

export function useStockSearch() {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Return hot stocks initially as default recommendations
      return MOCK_STOCKS.slice(0, 6);
    }

    let filtered = MOCK_STOCKS.filter((stock) => {
      const codeMatch = stock.code.includes(trimmed);
      const nameMatch = stock.name.toLowerCase().includes(trimmed);
      const categoryMatch = stock.category.toLowerCase().includes(trimmed);
      return codeMatch || nameMatch || categoryMatch;
    });

    // 動態支援任意代號查詢 (4~6位純數字或字母，例如未知代碼)與動態載入、動態 K 線、動態籌碼
    if (/^[a-zA-Z0-9]{4,6}$/.test(trimmed)) {
      const hasExactMatch = MOCK_STOCKS.some((s) => s.code === trimmed);
      if (!hasExactMatch) {
        const dynamicStock = findStockByCode(trimmed);
        if (dynamicStock && !filtered.some((s) => s.code === trimmed)) {
          filtered = [dynamicStock, ...filtered];
        }
      }
    }

    return filtered;
  }, [query]);

  return {
    query,
    setQuery,
    searchResults,
    allStocks: MOCK_STOCKS,
  };
}
