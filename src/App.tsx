/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabId, BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Watchlist } from './pages/Watchlist';
import { StockDetail } from './pages/StockDetail';
import { ChipAnalysis } from './pages/ChipAnalysis';
import { SearchOverlay } from './components/SearchOverlay';
import { SearchBar } from './components/SearchBar';
import { findStockByCode, MOCK_STOCKS, MOCK_MARKET_INDICES, MOCK_NEWS, updateStocksWithLiveData } from './data';
import { Wifi, Battery, Signal, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useWatchlist } from './hooks/useWatchlist';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedStockCode, setSelectedStockCode] = useState<string>('2330');
  const [searchOpen, setSearchOpen] = useState(false);
  const { watchlistCodes, toggleStock, removeStock } = useWatchlist();

  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [stocksUpdated, setStocksUpdated] = useState(0);
  const [currentTime, setCurrentTime] = useState('09:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 5));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchLivePrices = async () => {
    try {
      const response = await fetch('/api/stocks');
      const json = await response.json();
      if (json.success && json.data) {
        updateStocksWithLiveData(json.data);
        setLastFetch(new Date(json.lastUpdated || Date.now()));
        setStocksUpdated((prev) => prev + 1);
      }
    } catch (e) {
      console.warn('Could not load live stocks from Backend OpenAPI', e);
    }
  };

  useEffect(() => {
    fetchLivePrices();

    // Fetch update from backend OpenAPI proxy every 15 minutes
    const interval = setInterval(fetchLivePrices, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectStock = (code: string) => {
    setSelectedStockCode(code);
    setActiveTab('detail'); // Instantly focus detail page
  };

  const activeStock = findStockByCode(selectedStockCode);

  return (
    <div id="app-viewport-wrapper" className="min-h-screen bg-slate-950 flex items-center justify-center font-sans tracking-tight select-none">
      {/* Decorative desktop background graphics */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-slate-950 to-black pointer-events-none z-0 opacity-40" />
      
      {/* Desktop sidebar info (Only displays in large screens) */}
      <div className="hidden lg:flex flex-col max-w-sm text-slate-400 absolute left-12 p-6 pointer-events-none space-y-6 z-10 select-text">
        <div id="desktop-headline" className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/src/assets/images/red_flat_coin_1779617171026.png" 
              alt="台股行動 K 線與籌碼分析 Logo" 
              className="w-12 h-12 rounded-xl border border-red-500/20 shadow-md shadow-red-500/5 object-cover" 
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              台股行動 K 線助手
            </span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight tracking-normal pt-1 font-mono">
            台股行動 K 線與籌碼分析
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
            繁體中文介面，匯聚個股 K 線、三大法人籌碼比率、主力大戶分點與融資券觀測指標。
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-900">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/15" />
            特色亮點與指標
          </h3>
          <ul className="text-xs text-slate-500 space-y-2.5">
            <li>• <strong>極速 K 線與均線</strong>: MA5、MA10、MA20 均線指標自由切換</li>
            <li>• <strong>三大法人籌碼超</strong>: 直觀的外資、投信、自營商買賣超成交彙總</li>
            <li>• <strong>主力券商分點排行</strong>: 追蹤金主力道、揭密市場贏家</li>
            <li>• <strong>融資融券使用餘額</strong>: 觀測散戶市場情緒反指標</li>
          </ul>
        </div>
      </div>

      {/* Main smartphone frame (centers contents beautifully on desktop) */}
      <div
        id="smartphone-frame"
        className="w-full h-screen lg:h-[860px] lg:max-w-[400px] lg:rounded-[40px] lg:border-[10px] lg:border-slate-800 bg-white shadow-2xl relative flex flex-col overflow-hidden z-10 transition-all duration-300 transform"
      >
        {/* Simulated iOS status topbar (Only shows on desktop heights) */}
        <div id="device-status-topbar" className="hidden lg:flex items-center justify-between px-6 pt-3 pb-1 bg-white text-slate-900 border-b border-slate-50 text-[11px] font-bold font-mono">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5">
            {lastFetch && (
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200 mr-1 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-red-500" />
                TWSE OpenAPI
              </span>
            )}
            <Signal className="w-3.5 h-3.5 text-slate-800" />
            <Wifi className="w-3.5 h-3.5 text-slate-800" />
            <Battery className="w-4 h-4 text-slate-800" />
          </div>
        </div>

        {/* 全局粘性搜尋欄 */}
        <SearchBar onSelectStock={handleSelectStock} />

        {/* Dynamic page container */}
        <div id="dynamic-pages-container" className="flex-1 overflow-y-auto relative bg-[#F3F4F6]">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
                className="h-full"
              >
                <Home
                  stocks={MOCK_STOCKS}
                  indices={MOCK_MARKET_INDICES}
                  news={MOCK_NEWS}
                  onSelectStock={handleSelectStock}
                  onOpenSearch={() => setSearchOpen(true)}
                  onToggleWatchlist={toggleStock}
                  watchlistCodes={watchlistCodes}
                  onRefresh={fetchLivePrices}
                />
              </motion.div>
            )}

            {activeTab === 'watchlist' && (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
                className="h-full"
              >
                <Watchlist
                  stocks={MOCK_STOCKS}
                  watchlistCodes={watchlistCodes}
                  onSelectStock={handleSelectStock}
                  onRemoveFromWatchlist={removeStock}
                  onOpenSearch={() => setSearchOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'detail' && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
                className="h-full"
              >
                <StockDetail
                  stock={activeStock}
                  watchlistCodes={watchlistCodes}
                  onToggleWatchlist={toggleStock}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              </motion.div>
            )}

            {activeTab === 'chip' && (
              <motion.div
                key="chip"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
                className="h-full"
              >
                <ChipAnalysis
                  selectedStockCode={selectedStockCode}
                  onSelectStock={(code) => setSelectedStockCode(code)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Sliding Search Overlay */}
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelectStock={handleSelectStock}
            watchlistCodes={watchlistCodes}
            onToggleWatchlist={toggleStock}
          />
        </div>

        {/* Global Bottom Navigation Sticky Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          selectedStockCode={selectedStockCode}
        />
      </div>
    </div>
  );
}

