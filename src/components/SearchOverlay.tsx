import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../types';
import { MOCK_STOCKS, findStockByCode } from '../data';
import { Search, X, Plus, Check, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useWatchlist } from '../hooks/useWatchlist';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (code: string) => void;
  watchlistCodes?: string[];
  onToggleWatchlist?: (code: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectStock,
  watchlistCodes: propWatchlistCodes,
  onToggleWatchlist
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { watchlistCodes: hookWatchlistCodes, toggleStock } = useWatchlist();

  const activeWatchlistCodes = propWatchlistCodes || hookWatchlistCodes;
  const activeToggleWatchlist = onToggleWatchlist || toggleStock;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setResults(MOCK_STOCKS.slice(0, 5)); // 預設推薦前五個
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery === '') {
      setResults(MOCK_STOCKS.slice(0, 5));
    } else {
      let filtered = MOCK_STOCKS.filter(
        (stock) =>
          stock.name.toLowerCase().includes(trimmedQuery) ||
          stock.code.toLowerCase().includes(trimmedQuery) ||
          stock.category.toLowerCase().includes(trimmedQuery)
      );

      // 動態支援任意代號查詢 (4~6位純數字或字母，例如未知代碼 2331) 與動態載入、動態 K 線、動態籌碼
      if (/^[a-zA-Z0-9]{4,6}$/.test(trimmedQuery)) {
        const hasExactMatch = MOCK_STOCKS.some((s) => s.code === trimmedQuery);
        if (!hasExactMatch) {
          const dynamicStock = findStockByCode(trimmedQuery);
          if (dynamicStock && !filtered.some((s) => s.code === trimmedQuery)) {
            filtered = [dynamicStock, ...filtered];
          }
        }
      }
      setResults(filtered);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div id="search-overlay-backdrop" className="absolute inset-0 z-50 bg-white flex flex-col animate-fade-in">
      {/* 搜尋頂欄 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white sticky top-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search-input"
            ref={inputRef}
            type="text"
            placeholder="請輸入股名或代號（例：2330、台積電）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-8 py-2 w-full text-sm bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg h-9 transition-all"
          />
          {query && (
            <button
              id="clear-search-btn"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          id="close-search-btn"
          onClick={onClose}
          className="text-xs font-medium text-slate-600 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
        >
          取消
        </button>
      </div>

      {/* 搜尋結果 / 熱門推薦 */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <h3 className="text-xs font-semibold text-slate-400 px-1 py-2 flex items-center gap-1">
          {query ? '搜尋結果' : '熱門追蹤個股推荐'}
        </h3>

        <div className="space-y-1">
          {results.length > 0 ? (
            results.map((stock) => {
              const inWatchlist = activeWatchlistCodes.includes(stock.code);
              const isUp = stock.priceChange >= 0;

              return (
                <div
                  id={`search-item-${stock.code}`}
                  key={stock.code}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => {
                    onSelectStock(stock.code);
                    onClose();
                  }}
                >
                  {/* 左側股名、代碼 */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-gray-200">
                      <span className="text-[10px] font-bold text-slate-400 tracking-tight leading-none mb-1">{stock.category}</span>
                      <span className="text-xs font-mono font-bold text-slate-600 leading-none">{stock.code}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{stock.name}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5">
                        現價: {stock.currentPrice} | 漲跌: 
                        <span className={isUp ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>
                          {isUp ? ' +' : ' '}{stock.priceChangePercent.toFixed(2)}%
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 右側操作按鈕 */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`toggle-watchlist-search-${stock.code}`}
                      className={`p-1.5 rounded-lg border transition-all ${
                        inWatchlist
                          ? "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        activeToggleWatchlist(stock.code);
                      }}
                      title={inWatchlist ? "從自選股移除" : "加入自選股"}
                    >
                      {inWatchlist ? (
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                      )}
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <span className="text-slate-300 text-3xl font-mono block mb-2">🔍</span>
              <p className="text-sm text-slate-400 font-medium">查無相關股票「{query}」</p>
              <p className="text-xs text-slate-300 mt-1">請試試其他股票代號或關鍵字</p>
            </div>
          )}
        </div>

        {/* 台灣常用熱門分類快捷點選 */}
        {!query && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-slate-400 px-1 mb-2">熱門類股快捷搜尋</h4>
            <div className="flex flex-wrap gap-2 px-1">
              {['半導體', '電子', '金融', '航運', 'ETF'].map((cat) => (
                <button
                  id={`cat-quick-${cat}`}
                  key={cat}
                  onClick={() => setQuery(cat)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-gray-100 hover:bg-blue-600 hover:text-white border border-gray-200 rounded-lg transition-all cursor-pointer"
                >
                  {cat}類股
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
