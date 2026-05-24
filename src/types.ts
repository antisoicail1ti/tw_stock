export interface Stock {
  id: string; // "2330"
  name: string; // "台積電"
  code: string; // "2330"
  category: string; // "半導體" | "電子" | "金融" | "航運" | "ETF"
  market?: string; // "TWSE" | "TPEx"
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  yesterdayClose: number;
  priceChange: number; // +15
  priceChangePercent: number; // +1.52
  volume: number; // 成交量 (張)
  turnover: number; // 成交金額 (億元)
  peRatio: number; // 本益比
  pbRatio: number; // 股淨比
  dividendYield: number; // 殖利率 (%)
}

export interface KLineData {
  time: string; // "2026-05-24" or "09:30"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // Volume in lots/shares
  ma5?: number;
  ma10?: number;
  ma20?: number;
}

export interface InstitutionalChip {
  date: string;
  foreignNetBuy: number; // 外資買賣超 (張)，正為買超、負為賣超
  investmentTrustNetBuy: number; // 投信買賣超 (張)
  dealerNetBuy: number; // 自營商買賣超 (張)
}

export interface RetailMarginRatio {
  date: string;
  marginBuy: number; // 融資餘額 (張)
  shortSell: number; // 融券餘額 (張)
  marginRatio: number; // 融資使用率 %
}

export interface ChipConcentration {
  period: '1D' | '5D' | '10D' | '20D';
  concentration: number; // 籌碼集中度 %
  主力比率: number; // 主力買超 %
}

export interface TopBrokerBranchDetails {
  branchName: string; // 券商分點名稱
  buyVolume: number; // 買進張數
  sellVolume: number; // 賣出張數
  netVolume: number; // 買賣超張數
}

export interface StockChipAnalysis {
  stockId: string;
  institutionalData: InstitutionalChip[];
  retailMarginData: RetailMarginRatio[];
  concentrationData: ChipConcentration[];
  topBuyers: TopBrokerBranchDetails[];
  topSellers: TopBrokerBranchDetails[];
  chipScore: number; // 籌碼評分 (1-100)
  chipSignal: '偏多' | '中立' | '偏空';
}

export interface MarketIndex {
  name: string; // "加權指數" | "櫃買指數"
  current: number;
  change: number;
  changePercent: number;
  volume: number; // 億元
  high: number;
  low: number;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  stockTags: string[]; // ["2330", "2317"]
  sentiment: 'positive' | 'neutral' | 'negative';
}
