import React, { useState, useMemo } from 'react';
import { Stock, KLineData, StockChipAnalysis } from '../types';
import { generateMockKLine, getOrGenerateChipAnalysis } from '../data';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid, Line, ComposedChart
} from 'recharts';
import { 
  Star, Plus, Check, TrendingUp, TrendingDown, Clock, HelpCircle, 
  ChevronRight, Swords
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Custom tooltip renderer for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div id="recharts-custom-tooltip" className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-[10px] space-y-1 shadow-md">
        <p className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">{data.time || label}</p>
        <p className="flex justify-between gap-4">
          <span>收盤價:</span>
          <span className="font-bold text-red-400">{data.close.toFixed(2)}</span>
        </p>
        <p className="flex justify-between gap-4">
          <span>開盤/最高:</span>
          <span>{data.open.toFixed(2)} / {data.high.toFixed(2)}</span>
        </p>
        <p className="flex justify-between gap-4">
          <span>最低價:</span>
          <span>{data.low.toFixed(2)}</span>
        </p>
        {data.ma5 !== undefined && (
          <p className="flex justify-between gap-4 text-blue-400">
            <span>MA5:</span>
            <span>{data.ma5.toFixed(2)}</span>
          </p>
        )}
        {data.ma20 !== undefined && (
          <p className="flex justify-between gap-4 text-pink-400">
            <span>MA20:</span>
            <span>{data.ma20.toFixed(2)}</span>
          </p>
        )}
        <p className="flex justify-between gap-4 text-amber-400 border-t border-slate-800 pt-1 mt-1">
          <span>成交量:</span>
          <span>{data.volume.toLocaleString()} 張</span>
        </p>
      </div>
    );
  }
  return null;
};

interface StockDetailProps {
  stock: Stock;
  watchlistCodes: string[];
  onToggleWatchlist: (code: string) => void;
  onNavigateToTab: (tab: 'home' | 'watchlist' | 'detail' | 'chip') => void;
}

export const StockDetail: React.FC<StockDetailProps> = ({
  stock,
  watchlistCodes,
  onToggleWatchlist,
  onNavigateToTab
}) => {
  const [chartPeriod, setChartPeriod] = useState<'5D' | '1M' | '3M'>('1M');
  const [showMA5, setShowMA5] = useState(true);
  const [showMA10, setShowMA10] = useState(false);
  const [showMA20, setShowMA20] = useState(true);

  // Load K-line data
  const originalKLine = useMemo(() => generateMockKLine(stock), [stock]);
  
  // Slice K-line data based on chartPeriod
  const chartData = useMemo(() => {
    if (chartPeriod === '5D') return originalKLine.slice(-5);
    if (chartPeriod === '3M') return originalKLine.slice(0); // Show max pregenerated (which is 20-30 days)
    return originalKLine.slice(-20); // 1M as default (about 20 business days)
  }, [originalKLine, chartPeriod]);

  const chipData = useMemo(() => getOrGenerateChipAnalysis(stock.code), [stock.code]);

  const isWatchlisted = watchlistCodes.includes(stock.code);
  const isUp = stock.priceChange > 0;
  const isDown = stock.priceChange < 0;

  const colorClass = isUp ? 'text-red-600' : isDown ? 'text-green-600' : 'text-slate-500';
  const bgClass = isUp ? 'bg-red-50 text-red-700 border-red-100' : isDown ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-700 border-slate-100';

  // Amplitude (振幅)
  const amplitude = ((stock.highPrice - stock.lowPrice) / stock.yesterdayClose) * 100;

  return (
    <div id={`stock-detail-root-${stock.code}`} className="flex flex-col bg-[#F3F4F6] min-h-full pb-8 relative">
      {/* Detail Upper Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center font-mono font-bold text-slate-500 border border-gray-200 text-xs">
            {stock.code}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-800">{stock.name}</h1>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-50 text-slate-400 font-medium rounded border border-gray-150">
                {stock.category}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">台股上市集中市場代碼: {stock.code}</p>
          </div>
        </div>

        <Button
          id="toggle-detail-watchlist"
          variant="outline"
          size="sm"
          onClick={() => onToggleWatchlist(stock.code)}
          className={`text-xs h-8 px-2.5 rounded-lg border-gray-200 text-slate-500 flex items-center gap-1 ${
            isWatchlisted ? 'bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-100 font-semibold' : 'hover:bg-slate-50'
          }`}
        >
          {isWatchlisted ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              已自選
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              加自選
            </>
          )}
        </Button>
      </div>

      {/* Immediate Stock Pricing Card */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 grid grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black tracking-tight font-mono ${colorClass}`}>
              {stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded border ${bgClass}`}>
              {isUp ? '+' : ''}{stock.priceChange.toFixed(2)} ({isUp ? '+' : ''}{stock.priceChangePercent.toFixed(2)}%)
            </span>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> 盤中即時 quote
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-right">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">最高</span>
            <span className="text-xs font-bold text-red-500 font-mono">{stock.highPrice}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">開盤價</span>
            <span className="text-xs font-bold text-slate-700 font-mono">{stock.openPrice}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">最低</span>
            <span className="text-xs font-bold text-green-500 font-mono">{stock.lowPrice}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">昨收價</span>
            <span className="text-xs font-semibold text-slate-400 font-mono">{stock.yesterdayClose}</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CHART CONTAINER (TRADINGVIEW CORE STYLE) */}
      <div className="bg-white p-4 border-b border-gray-200 flex flex-col gap-2">
        {/* Chart Period & MA Indicators Switches */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Chart Period selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
            {(['5D', '1M', '3M'] as const).map((p) => (
              <button
                id={`detail-chart-period-${p}`}
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  chartPeriod === p
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* MA filter switches */}
          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
            <button
              id="toggle-ma5-btn"
              onClick={() => setShowMA5(!showMA5)}
              className={`px-2 py-1 rounded border font-medium font-mono ${
                showMA5 
                  ? 'border-blue-200 bg-blue-50 text-blue-600' 
                  : 'border-slate-100 bg-slate-50/50 text-slate-400'
              }`}
            >
              MA5: {chartData[chartData.length - 1]?.ma5 || '-'}
            </button>
            <button
              id="toggle-ma20-btn"
              onClick={() => setShowMA20(!showMA20)}
              className={`px-2 py-1 rounded border font-medium font-mono ${
                showMA20 
                  ? 'border-pink-200 bg-pink-50 text-pink-600' 
                  : 'border-slate-100 bg-slate-50/50 text-slate-400'
              }`}
            >
              MA20: {chartData[chartData.length - 1]?.ma20 || '-'}
            </button>
          </div>
        </div>

        {/* Dynamic Composed Chart (Price with gradient + Volume) */}
        <div id="recharts-composed-chart-container" className="h-60 w-full mt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#ef4444" : "#10b981"} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={isUp ? "#ef4444" : "#10b981"} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                  axisLine={{ stroke: '#f1f5f9' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                  axisLine={{ stroke: '#f1f5f9' }}
                  tickLine={false}
                  orientation="right"
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Simulated Price Gradient Area */}
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke={isUp ? "#ef4444" : "#10b981"} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  name="股價"
                />

                {/* Moving Averages lines */}
                {showMA5 && (
                  <Line 
                    type="monotone" 
                    dataKey="ma5" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5} 
                    dot={false} 
                    activeDot={false}
                    name="MA5"
                  />
                )}
                
                {showMA20 && (
                  <Line 
                    type="monotone" 
                    dataKey="ma20" 
                    stroke="#ec4899" 
                    strokeWidth={1.5} 
                    dot={false} 
                    activeDot={false}
                    name="MA20"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300 text-xs">圖表載入中...</div>
          )}
        </div>

        {/* Sync Volume Plot Chart */}
        <div id="volume-bars-chart-container" className="h-16 w-full -mt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 5, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="volume" 
                  fill={isUp ? "rgba(239, 68, 68, 0.45)" : "rgba(16, 185, 129, 0.45)"}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Pages quick redirection to full chips analysis tab */}
      <div className="mx-4 mt-4 bg-blue-500/5 hover:bg-blue-500/8 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Swords className="w-5.2 h-5.2" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">解鎖【三大法人籌碼分析】</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">此個股晶片評分為 <span className="text-blue-600 font-bold">{chipData.chipScore}分</span>（訊號為{chipData.chipSignal}）</p>
          </div>
        </div>
        <Button
          id="detail-nav-to-chip-btn"
          onClick={() => {
            onNavigateToTab('chip');
          }}
          size="sm"
          variant="outline"
          className="h-8 text-xs font-bold border-blue-200 text-blue-600 bg-white shadow-sm rounded-lg flex items-center"
        >
          查看籌碼
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Multi-Metrics Bento Grid (PE, PB, Volume, etc) */}
      <div id="stock-detail-bento-grid" className="px-4 mt-4">
        <h3 className="text-xs font-bold text-slate-400 mb-2.5 px-0.5 flex items-center gap-1">
          基本面與交易數據
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="border-b border-r border-slate-100/60 pb-2.5 pr-2">
            <span className="text-[10px] text-slate-400 font-medium block">成交量 (張)</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">{stock.volume.toLocaleString()} 張</span>
          </div>
          <div className="border-b border-slate-100/60 pb-2.5 pl-2 md:border-r">
            <span className="text-[10px] text-slate-400 font-medium block">成交金額 (億)</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">{stock.turnover.toFixed(1)} 億元</span>
          </div>
          <div className="border-b border-r border-slate-100/60 pb-2.5 pr-2 md:pl-2">
            <span className="text-[10px] text-slate-400 font-medium block">振幅 %</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">▲ {amplitude.toFixed(2)} %</span>
          </div>
          <div className="border-b border-slate-100/60 pb-2.5 pl-2">
            <span className="text-[10px] text-slate-400 font-medium block">現金股利殖利率</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">{stock.dividendYield > 0 ? `${stock.dividendYield}%` : '-'}</span>
          </div>
          <div className="border-r border-slate-100/60 pt-2.5 pr-2">
            <span className="text-[10px] text-slate-400 font-medium block">本益比 (PE)</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">{stock.peRatio > 0 ? `${stock.peRatio} 倍` : '-'}</span>
          </div>
          <div className="pt-2.5 pl-2 md:border-r">
            <span className="text-[10px] text-slate-400 font-medium block">股價淨值比</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">{stock.pbRatio > 0 ? `${stock.pbRatio} 倍` : '-'}</span>
          </div>
          <div className="border-r border-slate-100/60 pt-2.5 pr-2 md:pl-2">
            <span className="text-[10px] text-slate-400 font-medium block">今日開高低 range</span>
            <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">{stock.lowPrice}-{stock.highPrice}</span>
          </div>
          <div className="pt-2.5 pl-2">
            <span className="text-[10px] text-slate-400 font-medium block">公司種類</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">{stock.category}產業</span>
          </div>
        </div>
      </div>

    </div>
  );
};
export default StockDetail;
