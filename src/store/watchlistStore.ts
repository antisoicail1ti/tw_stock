import { create } from 'zustand';

interface WatchlistState {
  watchlistCodes: string[];
  addStock: (code: string) => void;
  removeStock: (code: string) => void;
  toggleStock: (code: string) => void;
  hasStock: (code: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlistCodes: (() => {
    try {
      const stored = localStorage.getItem('tw_stocks_watchlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse watchlist from localStorage', e);
    }
    // Default seed symbols representing core Taiwan chip stocks
    const defaultWatch = ['2330', '2317', '0050', '00878'];
    try {
      localStorage.setItem('tw_stocks_watchlist', JSON.stringify(defaultWatch));
    } catch {
      // ignore
    }
    return defaultWatch;
  })(),

  addStock: (code: string) => {
    const { watchlistCodes } = get();
    if (!watchlistCodes.includes(code)) {
      const nextWatchlist = [...watchlistCodes, code];
      set({ watchlistCodes: nextWatchlist });
      try {
        localStorage.setItem('tw_stocks_watchlist', JSON.stringify(nextWatchlist));
      } catch (e) {
        console.warn('Failed to write watchlist to localStorage', e);
      }
    }
  },

  removeStock: (code: string) => {
    const { watchlistCodes } = get();
    const nextWatchlist = watchlistCodes.filter((c) => c !== code);
    set({ watchlistCodes: nextWatchlist });
    try {
      localStorage.setItem('tw_stocks_watchlist', JSON.stringify(nextWatchlist));
    } catch (e) {
      console.warn('Failed to write watchlist to localStorage', e);
    }
  },

  toggleStock: (code: string) => {
    const { watchlistCodes } = get();
    let nextWatchlist: string[];
    if (watchlistCodes.includes(code)) {
      nextWatchlist = watchlistCodes.filter((c) => c !== code);
    } else {
      nextWatchlist = [...watchlistCodes, code];
    }
    set({ watchlistCodes: nextWatchlist });
    try {
      localStorage.setItem('tw_stocks_watchlist', JSON.stringify(nextWatchlist));
    } catch (e) {
      console.warn('Failed to write watchlist to localStorage', e);
    }
  },

  hasStock: (code: string) => {
    return get().watchlistCodes.includes(code);
  }
}));
