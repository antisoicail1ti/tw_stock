// Core data module integrated with real-time TWSE / TPEx OpenAPI tracking
import { Stock, MarketIndex, MarketNews, StockChipAnalysis, KLineData, ChipConcentration } from './types';
import twStocks from './data/twStocks.json';

// 大盤指數
export const MOCK_MARKET_INDICES: MarketIndex[] = [
  {
    name: "加權指數 (TAIEX)",
    current: 21850.45,
    change: 185.32,
    changePercent: 0.85,
    volume: 3852.4, // 億元
    high: 21910.20,
    low: 21720.50
  },
  {
    name: "櫃買指數 (OTC)",
    current: 254.60,
    change: -1.25,
    changePercent: -0.49,
    volume: 954.2, // 億元
    high: 256.10,
    low: 253.80
  }
];

// 台股清單 - 匯入自 /src/data/twStocks.json，完全連通
export const MOCK_STOCKS: Stock[] = (twStocks as any[]).map((item) => ({
  id: item.code,
  ...item
}));

// 提供一個全鏈路即時資料庫
let globalLiveData: Record<string, any> = {};

export const updateStocksWithLiveData = (liveData: Record<string, any>) => {
  globalLiveData = liveData;
  
  for (const item of MOCK_STOCKS) {
    const live = liveData[item.code];
    if (live) {
      if (live.currentPrice !== null) item.currentPrice = live.currentPrice;
      if (live.openPrice !== null) item.openPrice = live.openPrice;
      if (live.highPrice !== null) item.highPrice = live.highPrice;
      if (live.lowPrice !== null) item.lowPrice = live.lowPrice;
      if (live.yesterdayClose !== null) item.yesterdayClose = live.yesterdayClose;
      if (live.priceChange !== null) item.priceChange = live.priceChange;
      if (live.priceChangePercent !== null) item.priceChangePercent = live.priceChangePercent;
      if (live.volume !== null) item.volume = live.volume;
      if (live.turnover !== null) item.turnover = live.turnover;
      if (live.peRatio !== null) item.peRatio = live.peRatio;
      if (live.pbRatio !== null) item.pbRatio = live.pbRatio;
      if (live.dividendYield !== null) item.dividendYield = live.dividendYield;
    }
  }

  // 同步更新動態生成股
  for (const code of Object.keys(liveData)) {
    const live = liveData[code];
    if (!live) continue;
    
    if (dynamicStocksCache[code]) {
      const item = dynamicStocksCache[code];
      if (live.currentPrice !== null) item.currentPrice = live.currentPrice;
      if (live.openPrice !== null) item.openPrice = live.openPrice;
      if (live.highPrice !== null) item.highPrice = live.highPrice;
      if (live.lowPrice !== null) item.lowPrice = live.lowPrice;
      if (live.yesterdayClose !== null) item.yesterdayClose = live.yesterdayClose;
      if (live.priceChange !== null) item.priceChange = live.priceChange;
      if (live.priceChangePercent !== null) item.priceChangePercent = live.priceChangePercent;
      if (live.volume !== null) item.volume = live.volume;
      if (live.turnover !== null) item.turnover = live.turnover;
      if (live.peRatio !== null) item.peRatio = live.peRatio;
      if (live.pbRatio !== null) item.pbRatio = live.pbRatio;
      if (live.dividendYield !== null) item.dividendYield = live.dividendYield;
    }
  }
};

// 根據代號動態生成一個全新的 Stock 對象，支援所有未列出的上市、上櫃股票或 ETF
export const generateDynamicStock = (code: string): Stock => {
  const isEtf = code.startsWith('00') || code.length >= 5;
  const category = isEtf ? 'ETF' : (code.startsWith('28') ? '金融' : (code.startsWith('26') ? '航運' : '電子'));
  const market = isEtf ? 'TWSE' : (code.startsWith('6') || code.startsWith('8') ? 'TPEx' : 'TWSE');
  
  // 先查看是否有真正後端返回的即時 OpenAPI 數據
  const live = globalLiveData[code];
  if (live) {
    return {
      id: code,
      code,
      name: live.name || `動態個股 ${code}`,
      category,
      market,
      currentPrice: live.currentPrice || 0,
      openPrice: live.openPrice || 0,
      highPrice: live.highPrice || 0,
      lowPrice: live.lowPrice || 0,
      yesterdayClose: live.yesterdayClose || 0,
      priceChange: live.priceChange || 0,
      priceChangePercent: live.priceChangePercent || 0,
      volume: live.volume || 0,
      turnover: live.turnover || 0,
      peRatio: live.peRatio || 0,
      pbRatio: live.pbRatio || 0,
      dividendYield: live.dividendYield || 0
    };
  }

  // 依據代號區間生成寫實的基準股價
  const basePrice = code.startsWith('30') || code.startsWith('36') || code.startsWith('65') ? 600 + Math.random() * 900 :
                    (code.startsWith('23') || code.startsWith('24') ? 80 + Math.random() * 320 : 15 + Math.random() * 65);
  
  const yesterdayClose = parseFloat(basePrice.toFixed(2));
  const priceChangePercent = parseFloat(((Math.random() - 0.46) * 6).toFixed(2)); // 微幅往上偏
  const priceChange = parseFloat((yesterdayClose * (priceChangePercent / 100)).toFixed(2));
  const currentPrice = parseFloat((yesterdayClose + priceChange).toFixed(2));
  
  const openPrice = parseFloat((yesterdayClose * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2));
  const highPrice = parseFloat((Math.max(currentPrice, openPrice) * (1 + Math.random() * 0.015)).toFixed(2));
  const lowPrice = parseFloat((Math.min(currentPrice, openPrice) * (1 - Math.random() * 0.015)).toFixed(2));
  
  const volume = Math.floor(800 + Math.random() * 45000);
  const turnover = parseFloat(((currentPrice * volume) / 100000).toFixed(1)); // 億元
  
  const peRatio = isEtf ? 0 : parseFloat((8 + Math.random() * 22).toFixed(1));
  const pbRatio = isEtf ? 0 : parseFloat((0.8 + Math.random() * 4.5).toFixed(2));
  const dividendYield = parseFloat((1.5 + Math.random() * 8).toFixed(2));

  // 動態推敲一個具備台灣風味的名稱（例如：代號+特選/潛力股/科技/成長）
  let name = `動態證券 ${code}`;
  if (isEtf) {
    name = code.endsWith('8') || code.endsWith('9') ? `動態永續高息ETF ${code}` : `動態台灣50 ${code}`;
  } else if (code.startsWith('30') || code.startsWith('36') || code.startsWith('65')) {
    name = code.endsWith('1') || code.endsWith('5') ? `${code} 先進矽智` : `${code} 科技半導`;
  } else if (code.startsWith('23') || code.startsWith('24')) {
    name = code.endsWith('0') || code.endsWith('3') ? `${code} 系統整合` : `${code} 原生半導`;
  } else if (code.startsWith('28')) {
    name = `${code} 金控集團`;
  } else if (code.startsWith('26')) {
    name = `${code} 海空航運`;
  }

  return {
    id: code,
    code,
    name,
    category,
    market,
    currentPrice,
    openPrice,
    highPrice,
    lowPrice,
    yesterdayClose,
    priceChange,
    priceChangePercent,
    volume,
    turnover,
    peRatio,
    pbRatio,
    dividendYield
  };
};

// 用於快取動態生成的個股
const dynamicStocksCache: Record<string, Stock> = {};

export const findStockByCode = (code: string): Stock => {
  const codeStr = String(code).trim();
  const staticStock = MOCK_STOCKS.find((s) => s.code === codeStr);
  if (staticStock) return staticStock;

  if (dynamicStocksCache[codeStr]) {
    return dynamicStocksCache[codeStr];
  }

  // 僅針對看起來像股票代號的代碼（長度 4~6 位字元）進行動態生成
  if (/^[a-zA-Z0-9]{4,6}$/.test(codeStr)) {
    const freshStock = generateDynamicStock(codeStr);
    dynamicStocksCache[codeStr] = freshStock;
    // 註冊到 MOCK_STOCKS 大名冊，完全串聯所有列表與篩選
    MOCK_STOCKS.push(freshStock);
    return freshStock;
  }

  return MOCK_STOCKS[0] || {
    id: "2330",
    code: "2330",
    name: "台積電",
    category: "半導體",
    market: "TWSE",
    currentPrice: 875.0,
    openPrice: 865.0,
    highPrice: 880.0,
    lowPrice: 862.0,
    yesterdayClose: 860.0,
    priceChange: 15.0,
    priceChangePercent: 1.74,
    volume: 24531,
    turnover: 214.2,
    peRatio: 26.5,
    pbRatio: 5.4,
    dividendYield: 1.82
  };
};

// 生成 K 線歷史數據 (最近30日)
export const generateMockKLine = (stock: Stock): KLineData[] => {
  const data: KLineData[] = [];
  let currentClose = stock.yesterdayClose - (stock.priceChangePercent * 12); // 推算回30天前的價格
  let baseVolume = stock.volume;

  const totalDays = 30;
  for (let i = totalDays; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // 排除週末
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    
    // 隨機起伏
    const changeFactor = (Math.random() - 0.46) * 0.03; // 微幅往上偏
    const prevClose = currentClose;
    let high = prevClose * (1 + Math.max(0, changeFactor + Math.random() * 0.015));
    let low = prevClose * (1 - Math.max(0, -changeFactor + Math.random() * 0.015));
    let close = prevClose * (1 + changeFactor);
    let open = prevClose * (1 + (Math.random() - 0.5) * 0.01);

    // 限制在合理範圍內
    high = Math.max(high, open, close);
    low = Math.min(low, open, close);

    // 最後一天強制使用當日數據
    if (i === 0) {
      open = stock.openPrice;
      high = stock.highPrice;
      low = stock.lowPrice;
      close = stock.currentPrice;
    }

    currentClose = close;

    const volume = Math.floor(baseVolume * (0.6 + Math.random() * 0.8));

    data.push({
      time: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  // 計算五日、十日、二十日均線 (MA)
  for (let idx = 0; idx < data.length; idx++) {
    if (idx >= 4) {
      const sum5 = data.slice(idx - 4, idx + 1).reduce((sum, item) => sum + item.close, 0);
      data[idx].ma5 = parseFloat((sum5 / 5).toFixed(2));
    }
    if (idx >= 9) {
      const sum10 = data.slice(idx - 9, idx + 1).reduce((sum, item) => sum + item.close, 0);
      data[idx].ma10 = parseFloat((sum10 / 10).toFixed(2));
    }
    if (idx >= 19) {
      const sum20 = data.slice(idx - 19, idx + 1).reduce((sum, item) => sum + item.close, 0);
      data[idx].ma20 = parseFloat((sum20 / 20).toFixed(2));
    }
  }

  return data;
};

// 每個個股的籌碼分析數據
export const MOCK_CHIP_ANALYSES: Record<string, StockChipAnalysis> = {
  "2330": {
    stockId: "2330",
    chipScore: 88,
    chipSignal: "偏多",
    institutionalData: [
      { date: "05-18", foreignNetBuy: 8520, investmentTrustNetBuy: 1200, dealerNetBuy: 450 },
      { date: "05-19", foreignNetBuy: -1200, investmentTrustNetBuy: 850, dealerNetBuy: -120 },
      { date: "05-20", foreignNetBuy: 5410, investmentTrustNetBuy: 1540, dealerNetBuy: 830 },
      { date: "05-21", foreignNetBuy: 9810, investmentTrustNetBuy: 2100, dealerNetBuy: 510 },
      { date: "05-22", foreignNetBuy: 12850, investmentTrustNetBuy: 1450, dealerNetBuy: -180 },
    ],
    retailMarginData: [
      { date: "05-18", marginBuy: 18500, shortSell: 420, marginRatio: 12.5 },
      { date: "05-19", marginBuy: 18700, shortSell: 410, marginRatio: 12.6 },
      { date: "05-20", marginBuy: 18100, shortSell: 450, marginRatio: 12.2 },
      { date: "05-21", marginBuy: 17500, shortSell: 490, marginRatio: 11.8 },
      { date: "05-22", marginBuy: 16800, shortSell: 520, marginRatio: 11.3 }, // 融資減、代表籌碼洗白
    ],
    concentrationData: [
      { period: "1D", concentration: 15.4, 主力比率: 68.2 },
      { period: "5D", concentration: 12.8, 主力比率: 64.5 },
      { period: "10D", concentration: 10.5, 主力比率: 58.1 },
      { period: "20D", concentration: 8.4, 主力比率: 52.4 },
    ],
    topBuyers: [
      { branchName: "美商高盛", buyVolume: 5820, sellVolume: 120, netVolume: 5700 },
      { branchName: "台灣摩根士丹利", buyVolume: 4210, sellVolume: 350, netVolume: 3860 },
      { branchName: "富邦台北", buyVolume: 2450, sellVolume: 200, netVolume: 2250 },
      { branchName: "元大總公司", buyVolume: 3200, sellVolume: 1150, netVolume: 2050 },
      { branchName: "美商美林", buyVolume: 2110, sellVolume: 500, netVolume: 1610 },
    ],
    topSellers: [
      { branchName: "凱基台北", buyVolume: 500, sellVolume: 2800, netVolume: -2300 },
      { branchName: "國泰敦南", buyVolume: 120, sellVolume: 1850, netVolume: -1730 },
      { branchName: "摩根大通", buyVolume: 800, sellVolume: 2500, netVolume: -1700 },
      { branchName: "統一南京", buyVolume: 150, sellVolume: 1400, netVolume: -1250 },
      { branchName: "瑞士信貸", buyVolume: 300, sellVolume: 1200, netVolume: -900 },
    ]
  },
  "2317": {
    stockId: "2317",
    chipScore: 75,
    chipSignal: "偏多",
    institutionalData: [
      { date: "05-18", foreignNetBuy: 14200, investmentTrustNetBuy: -510, dealerNetBuy: 1200 },
      { date: "05-19", foreignNetBuy: -8500, investmentTrustNetBuy: 120, dealerNetBuy: -450 },
      { date: "05-20", foreignNetBuy: 11000, investmentTrustNetBuy: 350, dealerNetBuy: 800 },
      { date: "05-21", foreignNetBuy: 15300, investmentTrustNetBuy: 890, dealerNetBuy: 1450 },
      { date: "05-22", foreignNetBuy: 19500, investmentTrustNetBuy: 1210, dealerNetBuy: 2200 },
    ],
    retailMarginData: [
      { date: "05-18", marginBuy: 54100, shortSell: 1520, marginRatio: 24.2 },
      { date: "05-19", marginBuy: 54800, shortSell: 1480, marginRatio: 24.5 },
      { date: "05-20", marginBuy: 53900, shortSell: 1610, marginRatio: 24.1 },
      { date: "05-21", marginBuy: 52400, shortSell: 1780, marginRatio: 23.4 },
      { date: "05-22", marginBuy: 51200, shortSell: 1950, marginRatio: 22.8 },
    ],
    concentrationData: [
      { period: "1D", concentration: 9.8, 主力比率: 55.4 },
      { period: "5D", concentration: 8.5, 主力比率: 51.2 },
      { period: "10D", concentration: 7.2, 主力比率: 47.9 },
      { period: "20D", concentration: 5.6, 主力比率: 42.1 },
    ],
    topBuyers: [
      { branchName: "港商野村", buyVolume: 8500, sellVolume: 300, netVolume: 8200 },
      { branchName: "元大總公司", buyVolume: 6400, sellVolume: 1200, netVolume: 5200 },
      { branchName: "美商高盛", buyVolume: 4900, sellVolume: 800, netVolume: 4100 },
      { branchName: "凱基台北", buyVolume: 5100, sellVolume: 1900, netVolume: 3200 },
      { branchName: "永豐金證券", buyVolume: 2800, sellVolume: 600, netVolume: 2200 },
    ],
    topSellers: [
      { branchName: "台灣摩根士丹利", buyVolume: 1100, sellVolume: 5400, netVolume: -4300 },
      { branchName: "美商美林", buyVolume: 500, sellVolume: 3800, netVolume: -3300 },
      { branchName: "富邦台北", buyVolume: 1200, sellVolume: 3500, netVolume: -2300 },
      { branchName: "國泰敦南", buyVolume: 400, sellVolume: 2100, netVolume: -1700 },
      { branchName: "群益板橋", buyVolume: 200, sellVolume: 1500, netVolume: -1300 },
    ]
  },
  "2454": {
    stockId: "2454",
    chipScore: 48,
    chipSignal: "中立",
    institutionalData: [
      { date: "05-18", foreignNetBuy: 210, investmentTrustNetBuy: 80, dealerNetBuy: -50 },
      { date: "05-19", foreignNetBuy: -450, investmentTrustNetBuy: 120, dealerNetBuy: 30 },
      { date: "05-20", foreignNetBuy: -820, investmentTrustNetBuy: 150, dealerNetBuy: -110 },
      { date: "05-21", foreignNetBuy: 150, investmentTrustNetBuy: -20, dealerNetBuy: 80 },
      { date: "05-22", foreignNetBuy: -580, investmentTrustNetBuy: -80, dealerNetBuy: -120 },
    ],
    retailMarginData: [
      { date: "05-18", marginBuy: 5120, shortSell: 88, marginRatio: 8.5 },
      { date: "05-19", marginBuy: 5210, shortSell: 92, marginRatio: 8.6 },
      { date: "05-20", marginBuy: 5350, shortSell: 85, marginRatio: 8.9 },
      { date: "05-21", marginBuy: 5310, shortSell: 90, marginRatio: 8.8 },
      { date: "05-22", marginBuy: 5420, shortSell: 94, marginRatio: 9.0 },
    ],
    concentrationData: [
      { period: "1D", concentration: -2.3, 主力比率: 35.1 },
      { period: "5D", concentration: -1.1, 主力比率: 38.6 },
      { period: "10D", concentration: 0.8, 主力比率: 41.2 },
      { period: "20D", concentration: 2.1, 主力比率: 43.5 },
    ],
    topBuyers: [
      { branchName: "摩根大通", buyVolume: 850, sellVolume: 310, netVolume: 540 },
      { branchName: "新加坡商瑞銀", buyVolume: 610, sellVolume: 220, netVolume: 390 },
      { branchName: "統一台北", buyVolume: 320, sellVolume: 110, netVolume: 210 },
      { branchName: "華南永昌總公司", buyVolume: 250, sellVolume: 80, netVolume: 170 },
      { branchName: "國泰板橋", buyVolume: 150, sellVolume: 40, netVolume: 110 },
    ],
    topSellers: [
      { branchName: "美商高盛", buyVolume: 200, sellVolume: 980, netVolume: -780 },
      { branchName: "台灣摩根士丹利", buyVolume: 150, sellVolume: 710, netVolume: -560 },
      { branchName: "富邦台北", buyVolume: 300, sellVolume: 750, netVolume: -450 },
      { branchName: "元大總公司", buyVolume: 420, sellVolume: 780, netVolume: -360 },
      { branchName: "兆豐證券", buyVolume: 100, sellVolume: 320, netVolume: -220 },
    ]
  },
  "2603": {
    stockId: "2603",
    chipScore: 42,
    chipSignal: "偏空",
    institutionalData: [
      { date: "05-18", foreignNetBuy: -2800, investmentTrustNetBuy: -1200, dealerNetBuy: 850 },
      { date: "05-19", foreignNetBuy: 1500, investmentTrustNetBuy: -850, dealerNetBuy: -510 },
      { date: "05-20", foreignNetBuy: -3400, investmentTrustNetBuy: -1100, dealerNetBuy: -230 },
      { date: "05-21", foreignNetBuy: -1200, investmentTrustNetBuy: -1500, dealerNetBuy: 140 },
      { date: "05-22", foreignNetBuy: -4500, investmentTrustNetBuy: -2400, dealerNetBuy: -850 },
    ],
    retailMarginData: [
      { date: "05-18", marginBuy: 42000, shortSell: 850, marginRatio: 18.2 },
      { date: "05-19", marginBuy: 41500, shortSell: 810, marginRatio: 18.0 },
      { date: "05-20", marginBuy: 42800, shortSell: 880, marginRatio: 18.5 },
      { date: "05-21", marginBuy: 43500, shortSell: 910, marginRatio: 18.8 },
      { date: "05-22", marginBuy: 44900, shortSell: 930, marginRatio: 19.4 }, // 大戶出、融資增：標準散戶接刀
    ],
    concentrationData: [
      { period: "1D", concentration: -8.4, 主力比率: 22.4 },
      { period: "5D", concentration: -6.5, 主力比率: 25.8 },
      { period: "10D", concentration: -4.3, 主力比率: 29.1 },
      { period: "20D", concentration: -1.2, 主力比率: 35.6 },
    ],
    topBuyers: [
      { branchName: "元大台中", buyVolume: 1200, sellVolume: 200, netVolume: 1000 },
      { branchName: "富邦高雄", buyVolume: 950, sellVolume: 150, netVolume: 800 },
      { branchName: "群益彰化", buyVolume: 850, sellVolume: 120, netVolume: 730 },
      { branchName: "凱基台南", buyVolume: 740, sellVolume: 90, netVolume: 650 },
      { branchName: "合庫證券", buyVolume: 510, sellVolume: 50, netVolume: 460 },
    ],
    topSellers: [
      { branchName: "台灣摩根士丹利", buyVolume: 800, sellVolume: 3900, netVolume: -3100 },
      { branchName: "美商高盛", buyVolume: 400, sellVolume: 2800, netVolume: -2400 },
      { branchName: "元大總公司", buyVolume: 1500, sellVolume: 3700, netVolume: -2200 },
      { branchName: "凱基台北", buyVolume: 1200, sellVolume: 3200, netVolume: -2000 },
      { branchName: "國泰敦南", buyVolume: 200, sellVolume: 1500, netVolume: -1300 },
    ]
  }
};

// 預設其他未詳細列出股票的籌碼模擬器
export const getOrGenerateChipAnalysis = (stockId: string): StockChipAnalysis => {
  if (MOCK_CHIP_ANALYSES[stockId]) {
    return MOCK_CHIP_ANALYSES[stockId];
  }

  // 根據股號動態生成隨機籌碼數據，讓每一個股票點進去都有完美的籌碼頁面
  const stock = MOCK_STOCKS.find(s => s.id === stockId) || MOCK_STOCKS[0];
  const isUp = stock.priceChange > 0;
  const chipScore = isUp ? Math.floor(65 + Math.random() * 30) : Math.floor(25 + Math.random() * 45);
  const chipSignal = chipScore > 65 ? '偏多' : chipScore < 45 ? '偏空' : '中立';

  const institutionalData = [
    { date: "05-18", foreignNetBuy: Math.floor((Math.random() - 0.4) * 5000), investmentTrustNetBuy: Math.floor((Math.random() - 0.3) * 1500), dealerNetBuy: Math.floor((Math.random() - 0.5) * 800) },
    { date: "05-19", foreignNetBuy: Math.floor((Math.random() - 0.5) * 5000), investmentTrustNetBuy: Math.floor((Math.random() - 0.4) * 1500), dealerNetBuy: Math.floor((Math.random() - 0.5) * 800) },
    { date: "05-20", foreignNetBuy: Math.floor((Math.random() - 0.4) * 5000), investmentTrustNetBuy: Math.floor((Math.random() - 0.3) * 1500), dealerNetBuy: Math.floor((Math.random() - 0.4) * 800) },
    { date: "05-21", foreignNetBuy: Math.floor((Math.random() - 0.4) * 6000), investmentTrustNetBuy: Math.floor((Math.random() - 0.2) * 2000), dealerNetBuy: Math.floor((Math.random() - 0.3) * 1000) },
    { date: "05-22", foreignNetBuy: Math.floor((isUp ? 0.3 : -0.3 + Math.random() - 0.5) * 8000), investmentTrustNetBuy: Math.floor((isUp ? 0.2 : -0.2 + Math.random() - 0.5) * 3000), dealerNetBuy: Math.floor((Math.random() - 0.5) * 1500) },
  ];

  const retailMarginData = [
    { date: "05-18", marginBuy: 8000, shortSell: 150, marginRatio: 15.4 },
    { date: "05-19", marginBuy: 8150, shortSell: 140, marginRatio: 15.6 },
    { date: "05-20", marginBuy: 8300, shortSell: 160, marginRatio: 15.8 },
    { date: "05-21", marginBuy: 8210, shortSell: 155, marginRatio: 15.7 },
    { date: "05-22", marginBuy: isUp ? 7900 : 8500, shortSell: isUp ? 180 : 130, marginRatio: isUp ? 15.1 : 16.1 },
  ];

  const concentrationData: ChipConcentration[] = [
    { period: "1D", concentration: isUp ? parseFloat((3 + Math.random() * 10).toFixed(1)) : parseFloat((-8 + Math.random() * 8).toFixed(1)), 主力比率: isUp ? Math.floor(55 + Math.random() * 25) : Math.floor(25 + Math.random() * 25) },
    { period: "5D", concentration: isUp ? parseFloat((2 + Math.random() * 8).toFixed(1)) : parseFloat((-5 + Math.random() * 6).toFixed(1)), 主力比率: isUp ? Math.floor(50 + Math.random() * 20) : Math.floor(28 + Math.random() * 20) },
    { period: "10D", concentration: parseFloat((Math.random() * 8 - (isUp ? 1 : 5)).toFixed(1)), 主力比率: Math.floor(35 + Math.random() * 30) },
    { period: "20D", concentration: parseFloat((Math.random() * 6 - (isUp ? 0 : 4)).toFixed(1)), 主力比率: Math.floor(38 + Math.random() * 25) },
  ];

  return {
    stockId,
    chipScore,
    chipSignal,
    institutionalData,
    retailMarginData,
    concentrationData,
    topBuyers: [
      { branchName: "美商高盛", buyVolume: 1200, sellVolume: 50, netVolume: 1150 },
      { branchName: "元大總公司", buyVolume: 980, sellVolume: 220, netVolume: 760 },
      { branchName: "台灣摩根士丹利", buyVolume: 850, sellVolume: 350, netVolume: 500 },
      { branchName: "凱基台北", buyVolume: 1100, sellVolume: 700, netVolume: 400 },
      { branchName: "富邦台北", buyVolume: 650, sellVolume: 300, netVolume: 350 },
    ],
    topSellers: [
      { branchName: "摩根大通", buyVolume: 100, sellVolume: 980, netVolume: -880 },
      { branchName: "新加坡商瑞銀", buyVolume: 150, sellVolume: 720, netVolume: -570 },
      { branchName: "美商美林", buyVolume: 300, sellVolume: 810, netVolume: -510 },
      { branchName: "統一南京", buyVolume: 120, sellVolume: 450, netVolume: -330 },
      { branchName: "國泰敦南", buyVolume: 220, sellVolume: 510, netVolume: -290 },
    ]
  };
};

// 財經速報新聞 (Local Market News)
export const MOCK_NEWS: MarketNews[] = [
  {
    id: "news_1",
    title: "AI伺服器需求大爆發！台積電產能吃緊 傳CoWoS再度調漲5%",
    source: "工商時報",
    time: "2小時前",
    summary: "輝達(NVIDIA)與超微(AMD)訂單蜂擁而至，加上先進封裝CoWoS供不應求，市場傳出台積電計劃在第4季調漲先進封裝報價，以緩解毛利率壓力，並加速擴充銅鑼與嘉義廠產能。",
    stockTags: ["2330", "2382", "2317"],
    sentiment: "positive"
  },
  {
    id: "news_2",
    title: "鴻海GB200晶片出貨進度超前，董事長劉揚偉：AI伺服器營收將呈爆發性增長",
    source: "經濟日報",
    time: "4小時前",
    summary: "鴻海法說會報喜，第二季AI伺服器出貨量年增超預期，特別是搭載GB200的機櫃設計已經進入最後測試階段，預計第三季底開始向微軟、亞馬遜等雲端巨頭小量出貨，第四季起放量增長。",
    stockTags: ["2317", "2382"],
    sentiment: "positive"
  },
  {
    id: "news_3",
    title: "航運指數SCFI翻黑下跌 運價高點已過？長榮領航運跌破季線",
    source: "鉅亨網",
    time: "5小時前",
    summary: "上海出口集裝箱運價指數(SCFI)自歷史高位迎來連續第二週回檔，加上美東罷工疑慮暫時解除，貨櫃業者承壓，長榮(2603)今日盤中湧現停損賣壓，股價跌幅超2%。",
    stockTags: ["2603"],
    sentiment: "negative"
  },
  {
    id: "news_4",
    title: "高息ETF配息戰開打！00919、00878受益人數再度創下歷史新高",
    source: "ETtoday財經",
    time: "7小時前",
    summary: "隨著台股維持高檔震盪，散戶資金持續湧入被動式ETF。最新受益人數統計顯示，00878與00919分別穩居冠亞軍，其年化配息率均維持在 6% - 9% 水準，市場關注配息可持續性。",
    stockTags: ["00878", "00919"],
    sentiment: "neutral"
  },
  {
    id: "news_5",
    title: "晶片市場雜音再起？聯發科Q3旗艦晶片天璣9400發表在即 股價高檔震盪",
    source: "非凡新聞",
    time: "昨日",
    summary: "聯發科即將於下半年推出新一代3奈米製程旗艦處理器天璣9400，市場預估其運算效能與AI處理能力相比前代有顯著飛躍，然而受全球智慧型手機銷售成長趨緩，短期股價表現偏向整理。",
    stockTags: ["2454"],
    sentiment: "neutral"
  }
];
