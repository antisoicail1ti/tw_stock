import React, { useState } from 'react';
import { Stock } from '../types';
import { StockCard } from '../components/StockCard';
import { Trash2, Plus, Star, Layers, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '../hooks/useWatchlist';

interface WatchlistProps {
  stocks: Stock[];
  watchlistCodes?: string[];
  onSelectStock: (code: string) => void;
  onRemoveFromWatchlist?: (code: string) => void;
  onOpenSearch: () => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  stocks,
  watchlistCodes: propWatchlistCodes,
  onSelectStock,
  onRemoveFromWatchlist,
  onOpenSearch
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [isEditing, setIsEditing] = useState(false);
  const { watchlistCodes: hookWatchlistCodes, removeStock } = useWatchlist();

  const activeWatchlistCodes = propWatchlistCodes || hookWatchlistCodes;
  const activeRemoveFromWatchlist = onRemoveFromWatchlist || removeStock;

  // Filter actual watchlisted stocks
  const watchlistedStocks = stocks.filter((stock) => activeWatchlistCodes.includes(stock.code));

  // Get list of unique categories in watchlisted stocks
  const categories = ['全部', ...Array.from(new Set(watchlistedStocks.map((s) => s.category)))];

  // Apply filters
  const filteredStocks = watchlistedStocks.filter((stock) => {
    if (selectedCategory === '全部') return true;
    return stock.category === selectedCategory;
  });

  // Calculate quick stats on watchlist
  const totalCount = watchlistedStocks.length;
  const upCount = watchlistedStocks.filter((s) => s.priceChange > 0).length;
  const downCount = watchlistedStocks.filter((s) => s.priceChange < 0).length;
  const flatCount = totalCount - upCount - downCount;

  const handleFocusSearch = () => {
    const input = document.getElementById('global-search-input');
    if (input) {
      input.focus();
    } else if (onOpenSearch) {
      onOpenSearch();
    }
  };

  return (
    <div id="watchlist-root" className="flex flex-col bg-[#F3F4F6] min-h-full pb-6">
      {/* Dynamic Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Star className="w-5.2 h-5.2 text-blue-600 fill-blue-600/10" />
            我的自選股
          </h1>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">盤中自動刷新，共 {totalCount} 檔追蹤中</p>
        </div>

        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <Button
              id="toggle-edit-watchlist"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={`text-xs h-8 px-2.5 rounded-lg border-gray-200 text-slate-600 font-medium ${
                isEditing ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' : ''
              }`}
            >
              {isEditing ? '完成' : '編輯管理'}
            </Button>
          )}
          <Button
            id="watchlist-add-search-btn"
            size="sm"
            onClick={handleFocusSearch}
            className="text-xs h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            新增
          </Button>
        </div>
      </div>

      {watchlistedStocks.length > 0 ? (
        <>
          {/* Quick Holding Overview Card */}
          <div className="p-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center justify-around text-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium mb-0.5">總追蹤</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{totalCount} 檔</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium mb-0.5">今天上漲</span>
                <span className="text-sm font-bold text-red-600 font-mono">▲ {upCount}</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium mb-0.5">平盤持平</span>
                <span className="text-sm font-bold text-slate-500 font-mono">{flatCount}</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium mb-0.5">今天下跌</span>
                <span className="text-sm font-bold text-green-600 font-mono">▼ {downCount}</span>
              </div>
            </div>
          </div>

          {/* Tag Quick Categories filter */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
              {categories.map((cat) => (
                <button
                  id={`cat-filter-${cat}`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs shrink-0 rounded-lg border font-medium ${
                    selectedCategory === cat
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Watchlisted Stocks List */}
          <div className="px-4 py-2 space-y-2">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <StockCard
                  key={stock.code}
                  stock={stock}
                  onClick={onSelectStock}
                  showFavoriteIcon={!isEditing}
                  actionIcon={
                    isEditing ? (
                      <Trash2 className="w-4 h-4 text-red-500 hover:scale-110 active:scale-95 transition-all" />
                    ) : undefined
                  }
                  onActionClick={
                    isEditing
                      ? (e, code) => {
                          e.stopPropagation();
                          activeRemoveFromWatchlist(code);
                        }
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="text-center py-10 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">此類別中暫無自選股</p>
                <p className="text-[10px] text-slate-300 mt-1">請切換類股或點上方「新增」添加</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div id="watchlist-empty-state" className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-500 animate-pulse">
            <Star className="w-8 h-8 fill-blue-100/40 text-blue-500 stroke-[1.5]" />
          </div>
          
          <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600/10" />
            自選股空空如也
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">
            快將您的愛股（例如台積電 2330、大盤 ETF 0050）加入自選名單，即可在第一時間追蹤即時動態與主力籌碼！
          </p>
          
          <Button
            id="watchlist-empty-state-search-trigger"
            onClick={onOpenSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-5 text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            極速新增第一檔自選股
          </Button>
        </div>
      )}
    </div>
  );
};
export default Watchlist;
