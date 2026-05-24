import React, { useState, useMemo } from 'react';
import { Stock, StockChipAnalysis } from '../types';
import { MOCK_STOCKS, getOrGenerateChipAnalysis } from '../data';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import { 
  Users, TrendingUp, TrendingDown, RefreshCw, Layers, Award,
  CheckCircle2, ArrowDownUp, AlertCircle, Sparkles, Trophy
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Custom Tooltip for Institutional Chart
const CustomChipTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div id="chip-custom-tooltip" className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-[10px] space-y-1 shadow-md">
        <p className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">{label} 法人買賣超</p>
        {payload.map((item: any) => {
          const val = item.value;
          return (
            <p key={item.name} className="flex justify-between gap-5 align-center">
              <span style={{ color: item.color }}>{item.name}:</span>
              <span className={`font-bold ${val >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {val >= 0 ? '買超 +' : '賣超 '}{val.toLocaleString()} 張
              </span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface ChipAnalysisProps {
  onSelectStock: (code: string) => void;
  selectedStockCode: string;
}

export const ChipAnalysis: React.FC<ChipAnalysisProps> = ({
  onSelectStock,
  selectedStockCode
}) => {
  const [stockCode, setStockCode] = useState(selectedStockCode || '2330');
  const [chipTab, setChipTab] = useState<'institutions' | 'margin' | 'branches'>('institutions');
  const [threshold, setThreshold] = useState<100 | 400 | 1000>(400);

  // Trigger sync if parent's selectedStockCode changes
  useMemo(() => {
    if (selectedStockCode && selectedStockCode !== stockCode) {
      setStockCode(selectedStockCode);
    }
  }, [selectedStockCode]);

  // Load active stock info
  const activeStock = useMemo(() => {
    return MOCK_STOCKS.find(s => s.code === stockCode) || MOCK_STOCKS[0];
  }, [stockCode]);

  // Load active stock's chips
  const activeChip: StockChipAnalysis = useMemo(() => {
    return getOrGenerateChipAnalysis(stockCode);
  }, [stockCode]);

  // Derive adjusted concentration data based on threshold
  const adjustedConcentrationData = useMemo(() => {
    let mult = 1.0;
    let mainMult = 1.0;
    if (threshold === 100) {
      mult = 1.35;
      mainMult = 1.15;
    } else if (threshold === 1000) {
      mult = 0.65;
      mainMult = 0.85;
    }

    return activeChip.concentrationData.map((con) => {
      let adjustedVal = parseFloat((con.concentration * mult).toFixed(2));
      let adjustedMain = Math.min(100, Math.max(10, Math.floor(con.主力比率 * mainMult)));
      return {
        ...con,
        concentration: adjustedVal,
        主力比率: adjustedMain,
      };
    });
  }, [activeChip.concentrationData, threshold]);

  const con5D = useMemo(() => {
    const data = adjustedConcentrationData.find((d) => d.period === '5D');
    const pct = data ? data.concentration : 0;
    const isUp = pct >= 0;
    
    let delta = 0;
    if (threshold === 100) {
      delta = isUp ? 1.62 : -1.25;
    } else if (threshold === 400) {
      delta = isUp ? 0.95 : -0.75;
    } else {
      delta = isUp ? 0.45 : -0.30;
    }

    const charCodeSum = String(stockCode).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offset = (charCodeSum % 10) / 10;
    const finalDelta = isUp ? (delta + offset) : (delta - offset);
    const finalDeltaStr = `${finalDelta > 0 ? '+' : ''}${finalDelta.toFixed(2)}%`;

    let trendText = '';
    if (pct > 6) {
      trendText = '強大吸籌 • 持股集中';
    } else if (pct > 0) {
      trendText = '主力吸籌 • 籌碼安定';
    } else if (pct > -4) {
      trendText = '主力流出 • 微幅分散';
    } else {
      trendText = '大戶倒貨 • 籌碼渙散';
    }

    return {
      percentage: pct,
      deltaStr: finalDeltaStr,
      isDeltaUp: finalDelta >= 0,
      trendText,
    };
  }, [adjustedConcentrationData, threshold, stockCode]);

  const con20D = useMemo(() => {
    const data = adjustedConcentrationData.find((d) => d.period === '20D');
    const pct = data ? data.concentration : 0;
    const isUp = pct >= 0;

    let delta = 0;
    if (threshold === 100) {
      delta = isUp ? 2.45 : -2.10;
    } else if (threshold === 400) {
      delta = isUp ? 1.55 : -1.40;
    } else {
      delta = isUp ? 0.75 : -0.65;
    }

    const charCodeSum = String(stockCode).split('').reduce((acc, char) => acc + char.charCodeAt(0), 12);
    const offset = (charCodeSum % 8) / 10;
    const finalDelta = isUp ? (delta + offset) : (delta - offset);
    const finalDeltaStr = `${finalDelta > 0 ? '+' : ''}${finalDelta.toFixed(2)}%`;

    let trendText = '';
    if (pct > 5) {
      trendText = '波段鎖碼 • 高度控盤';
    } else if (pct > 0) {
      trendText = '長期集聚 • 溫和加碼';
    } else if (pct > -3) {
      trendText = '波段減持 • 低度流出';
    } else {
      trendText = '長線撤退 • 籌碼失控';
    }

    return {
      percentage: pct,
      deltaStr: finalDeltaStr,
      isDeltaUp: finalDelta >= 0,
      trendText,
    };
  }, [adjustedConcentrationData, threshold, stockCode]);

  // Handle stock change
  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setStockCode(code);
    onSelectStock(code); // Inform parent to update state globally
  };

  const signalColor = activeChip.chipSignal === '偏多' 
    ? 'text-red-650 bg-red-50 border-red-150' 
    : activeChip.chipSignal === '偏空' 
      ? 'text-green-650 bg-green-50 border-green-150' 
      : 'text-slate-650 bg-slate-50 border-slate-150';

  return (
    <div id="chip-analysis-root" className="flex flex-col bg-[#F3F4F6] min-h-full pb-8">
      {/* Search Header and Stock Picker Dropdown */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-sans">
            <Users className="w-5.2 h-5.2 text-blue-600 fill-blue-600/10" />
            三大法人籌碼分析
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">主力、外資、投信分點進出雷達</p>
        </div>

        {/* Traditional Taiwan Stock Picker dropdown */}
        <div className="relative">
          <select
            id="chip-stock-picker"
            value={stockCode}
            onChange={handleStockChange}
            className="appearance-none pl-3.5 pr-8 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {MOCK_STOCKS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <ArrowDownUp className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Corporate Chips Score Card Grid */}
      <div className="p-4 grid grid-cols-1 gap-3">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block tracking-tight">籌碼綜合評分 (量化打分)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-red-500">{activeChip.chipScore}</span>
              <span className="text-xs text-slate-400 font-semibold">分 / 100</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold leading-none">籌碼方向強度</span>
            <span className={`text-xs font-black px-3 py-1 rounded-xl border ${signalColor}`}>
              ● {activeChip.chipSignal}狀態
            </span>
          </div>
        </div>
      </div>

      {/* Category Tab selectors for secondary views */}
      <div className="px-4">
        <div className="flex border border-gray-200 bg-white p-1 rounded-lg shadow-sm">
          <button
            id="chip-tabs-institutions"
            onClick={() => setChipTab('institutions')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              chipTab === 'institutions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            法人進出
          </button>
          <button
            id="chip-tabs-margin"
            onClick={() => setChipTab('margin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              chipTab === 'margin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            融資融券
          </button>
          <button
            id="chip-tabs-branches"
            onClick={() => setChipTab('branches')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              chipTab === 'branches'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            主力分點
          </button>
        </div>
      </div>

      {/* Pages switcher container */}
      <div className="p-4 flex-1">
        {chipTab === 'institutions' && (
          <div className="space-y-4 animate-fade-in">
            {/* Net Actions Bar Chart */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  三大法人累計買賣超 (近5日)
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">單位：張</span>
              </div>

              <div id="institutions-recharts-chart" className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeChip.institutionalData}
                    margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                    <Tooltip content={<CustomChipTooltip />} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 9, paddingTop: 6 }} />
                    <ReferenceLine y={0} stroke="#cbd5e1" />
                    <Bar dataKey="foreignNetBuy" name="外資" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="investmentTrustNetBuy" name="投信" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="dealerNetBuy" name="自營商" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chip Concentration Panel */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3 space-y-2">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  大戶主力籌碼集中度 (重要先行指標)
                </h3>
                <div className="flex">
                  <div id="observation-threshold-wrapper" className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 px-1">門檻:</span>
                    {([100, 400, 1000] as const).map((t) => (
                      <button
                        id={`threshold-tab-${t}`}
                        key={t}
                        onClick={() => setThreshold(t)}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                          threshold === t
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {t}張以上
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {adjustedConcentrationData.map((con) => {
                  const positive = con.concentration >= 0;
                  return (
                    <div key={con.period} className="flex flex-col p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold block">{con.period}</span>
                      <span className={`text-xs font-bold font-mono my-1 block ${positive ? 'text-red-500' : 'text-green-500'}`}>
                        {con.concentration}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">主力比: {con.主力比率}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Special 5D & 20D Indicator Cards */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* 5D Card */}
                <div id="indicator-card-5d" className="p-3 bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-xl flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400">5日籌碼集中度</span>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-md flex items-center gap-0.5 font-mono ${
                      con5D.isDeltaUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {con5D.isDeltaUp ? '▲' : '▼'} {con5D.deltaStr}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-base font-black font-mono ${con5D.percentage >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {con5D.percentage}%
                    </span>
                  </div>

                  <div className="text-[9px] font-bold mt-2 text-slate-600 border-t border-slate-100 pt-1.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${con5D.percentage >= 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                    {con5D.trendText}
                  </div>
                </div>

                {/* 20D Card */}
                <div id="indicator-card-20d" className="p-3 bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-xl flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400">20日籌碼集中度</span>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-md flex items-center gap-0.5 font-mono ${
                      con20D.isDeltaUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {con20D.isDeltaUp ? '▲' : '▼'} {con20D.deltaStr}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-base font-black font-mono ${con20D.percentage >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {con20D.percentage}%
                    </span>
                  </div>

                  <div className="text-[9px] font-bold mt-2 text-slate-600 border-t border-slate-100 pt-1.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${con20D.percentage >= 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                    {con20D.trendText}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-sans pt-1">
                ※ <strong>主力大戶籌碼集中度</strong> 越高，代表該期間大戶主力累計買超占成交量比率越高，籌碼被特定券商吸走、拉抬阻力顯著減小。可以點擊上方觀測門檻（100張、400張、1000張）切換不同級別大戶的持籌力度。
              </p>
            </div>
          </div>
        )}

        {chipTab === 'margin' && (
          <div className="space-y-4 animate-fade-in">
            {/* Margin Loan and Short Sale charts */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  融資融券使用餘額趨勢 (散戶反指標)
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">單位：張</span>
              </div>

              <div id="margin-recharts-chart" className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeChip.retailMarginData}
                    margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                    <Tooltip />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 9, paddingTop: 6 }} />
                    <Area type="monotone" dataKey="marginBuy" name="融資餘額 (資)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.06} strokeWidth={2} />
                    <Area type="monotone" dataKey="shortSell" name="融券餘額 (券)" stroke="#10b981" fill="#10b981" fillOpacity={0.06} strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leverage Status Note */}
            <div className="p-4 bg-amber-50/60 border border-amber-100/80 rounded-2xl max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800">散戶反指標觀測要點：</h4>
              </div>
              <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-3 font-sans leading-relaxed">
                <li><strong>資增、大戶買超</strong>：主力大戶與融資多頭同向看多，多頭強勢上攻。</li>
                <li><strong>資增、大戶賣超</strong>：代表特定主力大戶在倒貨，籌碼由主動方散入被動散戶，股價多承壓。</li>
                <li><strong>資減、大戶買超</strong>：表示籌碼轉向高度安定的大戶手中，最容易形成主力的強烈軋空走勢。</li>
              </ul>
            </div>
          </div>
        )}

        {chipTab === 'branches' && (
          <div className="space-y-4 animate-fade-in">
            {/* Broker Branch Net Volumes Rank Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Buyers */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-bold text-red-600 flex items-center gap-1 border-b border-gray-100 pb-2 mb-2">
                  <Trophy className="w-3.5 h-3.5 text-red-500" />
                  主力金主【買超】分點前五名
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-bold border-b border-slate-50">
                        <th className="py-2">券商分點</th>
                        <th className="py-2 text-right">買進 (張)</th>
                        <th className="py-2 text-right text-red-500">買超 (張)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeChip.topBuyers.map((buyer, idx) => (
                        <tr id={`top-buyer-${idx}`} key={buyer.branchName} className="border-b border-slate-50/50 hover:bg-slate-50">
                          <td className="py-2 text-slate-700 font-semibold">{buyer.branchName}</td>
                          <td className="py-2 text-right font-mono text-slate-400">{buyer.buyVolume.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono font-bold text-red-600">+{buyer.netVolume.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Sellers */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <h3 className="text-xs font-bold text-green-600 flex items-center gap-1 border-b border-gray-100 pb-2 mb-2">
                  <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                  主力金主【賣超】分點前五名
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-bold border-b border-slate-50">
                        <th className="py-2">券商分點</th>
                        <th className="py-2 text-right">賣出 (張)</th>
                        <th className="py-2 text-right text-green-500">賣超 (張)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeChip.topSellers.map((seller, idx) => (
                        <tr id={`top-seller-${idx}`} key={seller.branchName} className="border-b border-slate-50/50 hover:bg-slate-50">
                          <td className="py-2 text-slate-700 font-semibold">{seller.branchName}</td>
                          <td className="py-2 text-right font-mono text-slate-400">{seller.sellVolume.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono font-bold text-green-600">{seller.netVolume.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-start gap-2 max-w-md mx-auto">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-[10px] font-bold text-slate-800">主力券商分點解說：</h5>
                <p className="text-[9px] text-slate-500 leading-normal">
                  台灣特色分點進出：外資通常經由美商高盛、摩根士丹利等美商外資託管帳戶進行操作；凱基台北、富邦台北則多為本地主力大戶、隔日沖券商的分點大本營。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChipAnalysis;
