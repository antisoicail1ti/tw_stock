import React from 'react';
import { MarketIndex } from '../types';
import { TrendingUp, TrendingDown, Volume2 } from 'lucide-react';

interface MarketIndicesProps {
  indices: MarketIndex[];
}

export const MarketIndices: React.FC<MarketIndicesProps> = ({ indices }) => {
  return (
    <div id="market-indices-container" className="grid grid-cols-2 gap-3 px-4 py-3 bg-[#F3F4F6] border-b border-gray-200">
      {indices.map((idx, index) => {
        const isUp = idx.change >= 0;
        const colorClass = isUp ? 'text-red-600' : 'text-green-600';
        const bgClass = isUp ? 'bg-red-50' : 'bg-green-50';
        const borderClass = isUp ? 'border-red-100' : 'border-green-100';

        return (
          <div
            id={`market-index-card-${index}`}
            key={idx.name}
            className={`flex flex-col p-3 rounded-xl border border-gray-150 bg-white shadow-sm transition-transform duration-200 active:scale-98`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
              <span>{idx.name}</span>
              {isUp ? (
                <TrendingUp className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-green-500" />
              )}
            </div>
            
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">
                {idx.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className={`font-semibold ${colorClass} ${bgClass} px-1.5 py-0.25 rounded`}>
                {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%)
              </span>
              <span className="text-slate-400 font-mono flex items-center gap-0.5">
                <Volume2 className="w-3 h-3 text-slate-300" />
                {idx.volume}億
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
