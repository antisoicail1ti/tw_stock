import React, { useState } from 'react';
import { MarketIndex, MarketNews, Stock } from '../types';
import { MarketIndices } from '../components/MarketIndices';
import { StockCard } from '../components/StockCard';
import { Search, TrendingUp, TrendingDown, Eye, RefreshCw, Star, Newspaper, MessageSquare, Flame, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ICON_DESIGNS } from '../App';

interface HomeProps {
  stocks: Stock[];
  indices: MarketIndex[];
  news: MarketNews[];
  onSelectStock: (code: string) => void;
  onOpenSearch: () => void;
  onToggleWatchlist: (code: string) => void;
  watchlistCodes: string[];
  selectedIconId?: string;
  onSelectIconId?: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  stocks,
  indices,
  news,
  onSelectStock,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCodes,
  selectedIconId,
  onSelectIconId,
}) => {
  const [activeRankTab, setActiveRankTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  const [refreshing, setRefreshing] = useState(false);

  // Rankings calculation
  const gainers = [...stocks]
    .filter(s => s.priceChangePercent > 0)
    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    .slice(0, 5);

  const losers = [...stocks]
    .filter(s => s.priceChangePercent < 0)
    .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
    .slice(0, 5);

  const topVolume = [...stocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <div id="home-page-root" className="flex flex-col bg-[#F3F4F6] min-h-full pb-4">
      {/* Sticky top-bar search triggers */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 px-4 py-3 border-b border-gray-200 z-30 flex items-center justify-between gap-3">
        <div 
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3.5 h-10 rounded-lg bg-gray-100 hover:bg-gray-200/60 transition-all cursor-pointer text-gray-400 font-medium"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-gray-500">搜尋股票、代號或資訊...</span>
        </div>
        
        <Button
          id="refresh-feed-btn"
          size="icon"
          variant="ghost"
          className={`h-10 w-10 text-gray-500 hover:text-blue-600 bg-gray-100 border-none rounded-lg ${refreshing ? 'animate-spin' : ''}`}
          onClick={handleRefresh}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Market Indicators (上市 & 上櫃 Index panels) */}
      <MarketIndices indices={indices} />

      {/* Ranking Widget Display - 漲跌排行 */}
      <div id="market-rank-card-section" className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            <h2 className="text-sm font-bold text-slate-800">盤中即時熱門排行</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">每 15 秒更新</span>
        </div>

        <Card className="border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/70 p-1">
            <button
              id="rank-tab-gainers"
              onClick={() => setActiveRankTab('gainers')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRankTab === 'gainers'
                  ? 'bg-red-50 text-red-600 border border-red-100 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              漲幅排行
            </button>
            <button
              id="rank-tab-losers"
              onClick={() => setActiveRankTab('losers')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRankTab === 'losers'
                  ? 'bg-green-50 text-green-600 border border-green-100 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              跌幅排行
            </button>
            <button
              id="rank-tab-volume"
              onClick={() => setActiveRankTab('volume')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeRankTab === 'volume'
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              成交量排行
            </button>
          </div>

          <CardContent className="p-3 space-y-2">
            {activeRankTab === 'gainers' && (
              <div className="space-y-2 animate-fade-in">
                {gainers.map((stock) => {
                  const inWatchlist = watchlistCodes.includes(stock.code);
                  return (
                    <StockCard
                      key={stock.code}
                      stock={stock}
                      onClick={onSelectStock}
                      actionIcon={<Star className={`w-4 h-4 ${inWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />}
                      onActionClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock.code);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {activeRankTab === 'losers' && (
              <div className="space-y-2 animate-fade-in">
                {losers.map((stock) => {
                  const inWatchlist = watchlistCodes.includes(stock.code);
                  return (
                    <StockCard
                      key={stock.code}
                      stock={stock}
                      onClick={onSelectStock}
                      actionIcon={<Star className={`w-4 h-4 ${inWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />}
                      onActionClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock.code);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {activeRankTab === 'volume' && (
              <div className="space-y-2 animate-fade-in">
                {topVolume.map((stock) => {
                  const inWatchlist = watchlistCodes.includes(stock.code);
                  return (
                    <StockCard
                      key={stock.code}
                      stock={stock}
                      onClick={onSelectStock}
                      actionIcon={<Star className={`w-4 h-4 ${inWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />}
                      onActionClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock.code);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Local News Feed Section with Sentiment Analysis */}
      <div id="financial-news-panel" className="px-4 mt-6">
        <div className="flex items-center gap-1.5 mb-3">
          <Newspaper className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800 font-sans">台股即時焦點速報</h2>
        </div>

        <div className="space-y-3">
          {news.map((item) => {
            const isPositive = item.sentiment === 'positive';
            const isNegative = item.sentiment === 'negative';
            const sentimentLabel = isPositive ? '偏多' : isNegative ? '偏空' : '中立';
            const sentimentBadgeClass = isPositive 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : isNegative 
                ? 'bg-green-50 text-green-600 border-green-100' 
                : 'bg-slate-50 text-slate-500 border-slate-100';

            return (
              <div
                id={`news-card-${item.id}`}
                key={item.id}
                className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-colors hover:border-gray-350 hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sentimentBadgeClass}`}>
                    {sentimentLabel}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-red-500 mb-1">
                  {item.title}
                </h3>
                
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-50">
                  {item.stockTags.map((tag) => {
                    const st = stocks.find((s) => s.code === tag);
                    if (!st) return null;
                    return (
                      <button
                        id={`news-tag-${item.id}-${tag}`}
                        key={tag}
                        onClick={() => onSelectStock(tag)}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-medium text-slate-500 hover:text-slate-800 rounded border border-slate-100/50 flex items-center gap-0.5 transition-colors"
                      >
                        <MessageSquare className="w-2.5 h-2.5 opacity-60" />
                        {st.name} {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Favicon Switcher Panel for Mobile Screens */}
      {selectedIconId && onSelectIconId && (
        <div id="mobile-favicon-designer-panel" className="px-4 mt-6 mb-8">
          <div className="flex items-center gap-1.5 mb-3">
            <Palette className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-800 font-sans">Favicon 專屬設計切換</h2>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
            <p className="text-[11px] text-slate-500 leading-normal">
              本站為您設計了三款獨創的<strong>台股硬幣風格</strong>圖標，點選以下即可即時更新瀏覽器標籤 (Favicon) 的圖案：
            </p>

            <div className="space-y-2">
              {ICON_DESIGNS.map((design) => {
                const isSelected = design.id === selectedIconId;
                return (
                  <button
                    key={design.id}
                    onClick={() => onSelectIconId(design.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-red-50 border-red-200 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-gray-100 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={design.src}
                        alt={design.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 text-[8px] flex items-center justify-center w-4 h-4 shadow border border-white">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block truncate text-slate-900">{design.name}</span>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">{design.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
