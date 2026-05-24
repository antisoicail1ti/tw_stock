import React from 'react';
import { Stock } from '../types';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Volume2 } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick: (code: string) => void;
  actionIcon?: React.ReactNode;
  onActionClick?: (e: React.MouseEvent, code: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  onClick,
  actionIcon,
  onActionClick
}) => {
  const isUp = stock.priceChange > 0;
  const isDown = stock.priceChange < 0;
  
  // Taiwan stock market styling: UP is Red, DOWN is Green
  const colorClass = isUp 
    ? 'text-red-600' 
    : isDown 
      ? 'text-green-600' 
      : 'text-slate-500';
      
  const bgClass = isUp 
    ? 'bg-red-50 text-red-700 border-red-100' 
    : isDown 
      ? 'bg-green-50 text-green-700 border-green-100' 
      : 'bg-slate-50 text-slate-700 border-slate-100';

  // Format Volume in Traditional Chinese Stock style
  const formatVolume = (vol: number) => {
    if (vol >= 10000) {
      return `${(vol / 10000).toFixed(1)}萬張`;
    }
    return `${vol.toLocaleString()}張`;
  };

  return (
    <div
      id={`stock-card-${stock.code}`}
      className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 shadow-sm flex items-center justify-between transition-all duration-200 active:scale-99 hover:bg-gray-50/55 hover:shadow-md cursor-pointer"
      onClick={() => onClick(stock.code)}
    >
      {/* List Item Left Side: Title & Symbol & Category */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 text-sm tracking-tight">{stock.name}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0.2 opacity-80 font-mono text-slate-400 bg-slate-50">
              {stock.category}
            </Badge>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-0.5">{stock.code}</span>
        </div>
      </div>

      {/* List Item Middle: A mini visual display */}
      <div className="hidden xs:flex flex-col items-end opacity-60">
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
          <Volume2 className="w-3 h-3" />
          {formatVolume(stock.volume)}
        </span>
        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
          PE: {stock.peRatio > 0 ? `${stock.peRatio}` : '-'}
        </span>
      </div>

      {/* List Item Right Side: Price, Percentage Pill & Watchlist action */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className={`font-mono text-base font-bold tracking-tight ${colorClass}`}>
            {stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: stock.currentPrice < 100 ? 2 : 1 })}
          </span>
          
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-xs font-bold font-mono py-0.5 px-2 rounded-md border ${bgClass} flex items-center gap-0.5`}>
              {isUp && <ArrowUpRight className="w-3 h-3" />}
              {isDown && <ArrowDownRight className="w-3 h-3" />}
              {isUp ? '+' : ''}{stock.priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {actionIcon && onActionClick && (
          <button
            id={`stock-card-action-${stock.code}`}
            className="p-1 px-1.5 ml-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-slate-50 transition-colors"
            onClick={(e) => {
              onActionClick(e, stock.code);
            }}
          >
            {actionIcon}
          </button>
        )}
      </div>
    </div>
  );
};
export default StockCard;
