import { useWatchlistStore } from '../store/watchlistStore';

export function useWatchlist() {
  const watchlistCodes = useWatchlistStore((state) => state.watchlistCodes);
  const addStock = useWatchlistStore((state) => state.addStock);
  const removeStock = useWatchlistStore((state) => state.removeStock);
  const toggleStock = useWatchlistStore((state) => state.toggleStock);
  const hasStock = useWatchlistStore((state) => state.hasStock);

  return {
    watchlistCodes,
    addStock,
    removeStock,
    toggleStock,
    hasStock: (code: string) => watchlistCodes.includes(code),
  };
}
