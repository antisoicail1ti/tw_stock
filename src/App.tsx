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
import { MOCK_STOCKS, MOCK_MARKET_INDICES, MOCK_NEWS } from './data';
import { Wifi, Battery, Signal, Sparkles, Palette, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ICON_DESIGNS = [
  {
    id: 'flat',
    name: '極簡扁平 (Design A)',
    description: '扁平現代向量，高對比、極其清晰，精緻指甲蓋 small size 最佳',
    src: '/src/assets/images/red_flat_coin_1779617171026.png'
  },
  {
    id: 'glossy',
    name: '未來感 3D 玻璃 (Design B)',
    description: '半透明磨砂玻璃與 3D 質感，科技金融風，立體潤澤圓滑',
    src: '/src/assets/images/glossy_3d_coin_1779617188159.png'
  },
  {
    id: 'luxury',
    name: '尊爵奢華霧面 (Design C)',
    description: '古典奢華紅與細緻雕刻金色圓環交織，沈穩專業、大氣質感',
    src: '/src/assets/images/luxury_matte_coin_1779617204708.png'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedStockCode, setSelectedStockCode] = useState<string>('2330');
  const [searchOpen, setSearchOpen] = useState(false);
  const [watchlistCodes, setWatchlistCodes] = useState<string[]>([]);
  const [selectedIconId, setSelectedIconId] = useState<string>(() => {
    try {
      return localStorage.getItem('selected_favicon_design') || 'flat';
    } catch {
      return 'flat';
    }
  });

  // Dynamic Favicon and Apple Touch Icon switcher
  useEffect(() => {
    try {
      localStorage.setItem('selected_favicon_design', selectedIconId);
    } catch (e) {
      console.warn('Failed to persist icon choice to local storage', e);
    }

    const currentIcon = ICON_DESIGNS.find((d) => d.id === selectedIconId) || ICON_DESIGNS[0];
    
    // Update link elements in index.html dynamically
    const faviconLnk = document.querySelector("link[rel='icon']");
    if (faviconLnk) {
      (faviconLnk as HTMLLinkElement).href = currentIcon.src;
    }
    const appleLnk = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLnk) {
      (appleLnk as HTMLLinkElement).href = currentIcon.src;
    }
  }, [selectedIconId]);

  const activeIcon = ICON_DESIGNS.find((d) => d.id === selectedIconId) || ICON_DESIGNS[0];

  // Local storage synchronization for Watchlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tw_stocks_watchlist');
      if (stored) {
        setWatchlistCodes(JSON.parse(stored));
      } else {
        // Default seed symbols representing core Taiwan chip stocks
        const defaultWatch = ['2330', '2317', '0050', '00878'];
        setWatchlistCodes(defaultWatch);
        localStorage.setItem('tw_stocks_watchlist', JSON.stringify(defaultWatch));
      }
    } catch (e) {
      console.warn("Local storage retrieval failed, using fallback empty state", e);
    }
  }, []);

  const handleToggleWatchlist = (code: string) => {
    let nextWatchlist: string[];
    if (watchlistCodes.includes(code)) {
      nextWatchlist = watchlistCodes.filter((c) => c !== code);
    } else {
      nextWatchlist = [...watchlistCodes, code];
    }
    setWatchlistCodes(nextWatchlist);
    try {
      localStorage.setItem('tw_stocks_watchlist', JSON.stringify(nextWatchlist));
    } catch (e) {
      console.warn("Local storage write failed", e);
    }
  };

  const handleRemoveFromWatchlist = (code: string) => {
    const nextWatchlist = watchlistCodes.filter((c) => c !== code);
    setWatchlistCodes(nextWatchlist);
    try {
      localStorage.setItem('tw_stocks_watchlist', JSON.stringify(nextWatchlist));
    } catch (e) {
      console.warn("Local storage write failed", e);
    }
  };

  const handleSelectStock = (code: string) => {
    setSelectedStockCode(code);
    setActiveTab('detail'); // Instantly focus detail page
  };

  const activeStock = MOCK_STOCKS.find((s) => s.code === selectedStockCode) || MOCK_STOCKS[0];

  return (
    <div id="app-viewport-wrapper" className="min-h-screen bg-slate-950 flex items-center justify-center font-sans tracking-tight select-none">
      {/* Decorative desktop background graphics */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-slate-950 to-black pointer-events-none z-0 opacity-40" />
      
      {/* Desktop sidebar info (Only displays in large screens) */}
      <div className="hidden lg:flex flex-col max-w-sm text-slate-400 absolute left-12 p-6 pointer-events-auto space-y-5 z-10 select-text">
        <div id="desktop-headline" className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={activeIcon.src} 
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

        {/* Dynamic Favicon Switcher Panel */}
        <div className="space-y-3 pt-4 border-t border-slate-900">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Palette className="w-3.5 h-3.5 text-red-500" />
            Favicon 專屬設計選擇
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            點擊以下專業設計即可即時更換瀏覽器標籤 (Favicon) 與本站標誌：
          </p>
          <div className="space-y-2">
            {ICON_DESIGNS.map((design) => {
              const isSelected = design.id === selectedIconId;
              return (
                <button
                  key={design.id}
                  onClick={() => setSelectedIconId(design.id)}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-500/5'
                      : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={design.src}
                      alt={design.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-red-500 border border-slate-950 text-white rounded-full p-0.5 text-[8px] flex items-center justify-center w-4 h-4 shadow">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block truncate leading-none">{design.name}</span>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{design.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
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
          <span>09:30</span> {/* Opening Stock Hour! */}
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-slate-850" />
            <Wifi className="w-3.5 h-3.5 text-slate-850" />
            <Battery className="w-4 h-4 text-slate-850" />
          </div>
        </div>

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
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlistCodes={watchlistCodes}
                  selectedIconId={selectedIconId}
                  onSelectIconId={setSelectedIconId}
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
                  onRemoveFromWatchlist={handleRemoveFromWatchlist}
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
                  onToggleWatchlist={handleToggleWatchlist}
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
            onToggleWatchlist={handleToggleWatchlist}
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

