// Home Dashboard containing real-time market indices, stock leaders and live news
import React, { useState } from 'react';
import { MarketIndex, MarketNews, Stock } from '../types';
import { MarketIndices } from '../components/MarketIndices';
import { StockCard } from '../components/StockCard';
import { Search, TrendingUp, TrendingDown, Eye, RefreshCw, Star, Newspaper, MessageSquare, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWatchlist } from '../hooks/useWatchlist';

interface HomeProps {
  stocks: Stock[];
  indices: MarketIndex[];
  news: MarketNews[];
  onSelectStock: (code: string) => void;
  onOpenSearch: () => void;
  onToggleWatchlist?: (code: string) => void;
  watchlistCodes?: string[];
  onRefresh?: () => Promise<void> | void;
}

export const Home: React.FC<HomeProps> = ({
  stocks,
  indices,
  news,
  onSelectStock,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCodes: propWatchlistCodes,
  onRefresh,
}) => {
  const [activeRankTab, setActiveRankTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  const [refreshing, setRefreshing] = useState(false);
  const { watchlistCodes: hookWatchlistCodes } = useWatchlist();

  const activeWatchlistCodes = propWatchlistCodes || hookWatchlistCodes;

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

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (e) {
        console.warn('Real-time OpenAPI refresh failed:', e);
      }
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <div id="home-page-root" className="flex flex-col bg-[#F3F4F6] min-h-full pb-4">
      {/* 盤中即時狀態與重整按鈕 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            即時加權大盤指數
          </h2>
          <p className="text-[10px] text-slate-450 mt-0.5 font-medium font-mono">盤中自動連線更新</p>
        </div>
        
        <Button
          id="refresh-feed-btn"
          size="sm"
          variant="outline"
          className={`h-8 px-3 text-xs text-slate-500 hover:text-blue-600 border-gray-200 rounded-lg flex items-center gap-1.5 bg-slate-50 ${refreshing ? 'animate-spin' : ''}`}
          onClick={handleRefresh}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          重整
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
                {gainers.map((stock) => (
                  <StockCard
                    key={stock.code}
                    stock={stock}
                    onClick={onSelectStock}
                    showFavoriteIcon={true}
                  />
                ))}
              </div>
            )}

            {activeRankTab === 'losers' && (
              <div className="space-y-2 animate-fade-in">
                {losers.map((stock) => (
                  <StockCard
                    key={stock.code}
                    stock={stock}
                    onClick={onSelectStock}
                    showFavoriteIcon={true}
                  />
                ))}
              </div>
            )}

            {activeRankTab === 'volume' && (
              <div className="space-y-2 animate-fade-in">
                {topVolume.map((stock) => (
                  <StockCard
                    key={stock.code}
                    stock={stock}
                    onClick={onSelectStock}
                    showFavoriteIcon={true}
                  />
                ))}
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
    </div>
  );
};
export default Home;
