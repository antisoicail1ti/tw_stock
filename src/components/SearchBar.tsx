import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Star, Check, Plus, Landmark, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useStockSearch } from '../hooks/useStockSearch';
import { useWatchlist } from '../hooks/useWatchlist';
import { Stock } from '../types';

interface SearchBarProps {
  onSelectStock: (code: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectStock,
  placeholder = '搜尋股票名稱、代號（如：2330, 台積電）'
}) => {
  const { query, setQuery, searchResults } = useStockSearch();
  const { watchlistCodes, toggleStock } = useWatchlist();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: Stock) => {
    onSelectStock(stock.code);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-40 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between gap-2.5">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9 py-2 w-full text-xs font-medium placeholder-slate-400 bg-slate-100 hover:bg-slate-200/50 focus:bg-white border-none focus:ring-1.5 focus:ring-blue-650 rounded-xl h-9 transition-all text-slate-850"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 p-0.5"
            title="清除搜尋"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Real-time floating overlay suggestion dropdown */}
      {isOpen && (
        <>
          {/* Background backdrop modal-feel */}
          <div className="fixed inset-x-0 bottom-0 top-[108px] bg-black/20 backdrop-blur-xs z-30 pointer-events-none" />
          
          <div className="absolute top-[48px] left-4 right-4 bg-white rounded-2xl border border-gray-200/90 shadow-xl max-h-[380px] overflow-y-auto z-40 animate-slide-up-faint">
            {searchResults.length > 0 ? (
              <div className="p-2 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-50 flex items-center justify-between">
                  <span>{query ? '搜尋配對結果' : '盤中熱門追蹤'}</span>
                  <span>共 {searchResults.length} 檔</span>
                </div>
                {searchResults.map((stock) => {
                  const isFavorite = watchlistCodes.includes(stock.code);
                  const isUp = stock.priceChange > 0;
                  const isDown = stock.priceChange < 0;

                  return (
                    <div
                      key={stock.code}
                      onClick={() => handleSelect(stock)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-gray-150 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Compact Badge design */}
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex flex-col items-center justify-center border border-gray-100">
                          <span className="text-[8px] font-bold text-slate-400 leading-none mb-0.5">{stock.category}</span>
                          <span className="text-xxs font-mono font-bold text-slate-700 leading-none">{stock.code}</span>
                        </div>
                        
                        <div className="flex flex-col min-w-[100px]">
                          <span className="text-xs font-extrabold text-slate-850 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {stock.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            現價 <strong className="text-slate-800">{stock.currentPrice}</strong> | 
                            <span className={`ml-1 font-bold ${isUp ? 'text-red-500' : isDown ? 'text-green-600' : 'text-slate-500'}`}>
                              {isUp ? '▲' : isDown ? '▼' : ' '} {stock.priceChangePercent.toFixed(2)}%
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Right quick actions: favorite toggle + detail click */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStock(stock.code);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isFavorite
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-white border-gray-200 text-slate-400 hover:text-slate-650'
                          }`}
                          title={isFavorite ? '移除自選' : '加自選股'}
                        >
                          {isFavorite ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </button>
                        <div className="p-1 text-slate-350 group-hover:text-blue-550 transition-colors group-hover:translate-x-0.5 duration-200">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl">
                <p className="text-xs font-bold text-slate-400">查無相關股票代號或名稱「{query}」</p>
                <p className="text-[10px] text-slate-400 mt-1.5">請試試 2330、台積電、聯發科 或 ETF 關鍵字</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
