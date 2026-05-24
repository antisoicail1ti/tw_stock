import React from 'react';
import { LayoutDashboard, Star, LineChart, Coins } from 'lucide-react';
import { motion } from 'motion/react';

export type TabId = 'home' | 'watchlist' | 'detail' | 'chip';

interface BottomNavProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  selectedStockCode: string; // To keep track of which stock detail is loaded
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  selectedStockCode
}) => {
  const navItems = [
    {
      id: 'home' as TabId,
      label: '首頁大盤',
      icon: LayoutDashboard,
    },
    {
      id: 'watchlist' as TabId,
      label: '我的自選',
      icon: Star,
    },
    {
      id: 'detail' as TabId,
      label: `${selectedStockCode} 個股`,
      icon: LineChart,
    },
    {
      id: 'chip' as TabId,
      label: '大戶籌碼',
      icon: Coins,
    },
  ];

  return (
    <div
      id="bottom-navigation-bar"
      className="bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-around py-2 px-1 sticky bottom-0 z-40 shadow-sm pb-safe"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            id={`nav-tab-${item.id}`}
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-colors focus:outline-none select-none touch-manipulation"
          >
            {/* Animated Background Ring Tracker */}
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="absolute inset-x-3 inset-y-1 bg-blue-50/60 border border-blue-100/50 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            <div className="relative">
              <Icon
                className={`w-5.5 h-5.5 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 scale-105 stroke-[2.5px]'
                    : 'text-gray-400 scale-100 stroke-[2px] hover:text-blue-600'
                }`}
              />
              {item.id === 'watchlist' && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>

            <span
              className={`text-[10px] font-bold tracking-tight mt-1 transition-all uppercase ${
                isActive 
                  ? 'text-blue-600 scale-102' 
                  : 'text-gray-400 hover:text-blue-600'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
export default BottomNav;
