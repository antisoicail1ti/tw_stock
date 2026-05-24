// Taiwan Stock Real-Time Track Engine via OpenAPI (TWSE/TPEx)
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// In-memory cache for live stock data
let stockCache: Record<string, any> = {};
let lastFetchTime = 0;

// Function to fetch real-time stock quotes from TWSE and TPEx OpenAPI
async function fetchTWSEData() {
  try {
    console.log("Fetching live Taiwan stock data from TWSE/TPEx OpenAPI...");
    
    // 1. Fetch STOCK_DAY_ALL (TWSE list)
    const resDay = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL");
    if (!resDay.ok) {
      throw new Error(`Failed to fetch STOCK_DAY_ALL: status ${resDay.status}`);
    }
    const dayData: any[] = await resDay.json();
    console.log(`Fetched ${dayData.length} stock quotes from TWSE`);

    // 2. Fetch BWIBBU_ALL (TWSE PE/PB/Dividend ratios)
    let bwbData: any[] = [];
    try {
      const resBwb = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL");
      if (resBwb.ok) {
        bwbData = await resBwb.json();
        console.log(`Fetched ${bwbData.length} PE/PB records from TWSE`);
      }
    } catch (e) {
      console.warn("Failed to fetch BWIBBU_ALL, continuing with quotes only", e);
    }

    const newCache: Record<string, any> = {};
    
    // Index BWIBBU_ALL records by code
    const bwbMap: Record<string, any> = {};
    for (const b of bwbData) {
      if (b.Code) {
        bwbMap[b.Code.trim()] = b;
      }
    }

    // Helper functions to parse values safely
    const parseVal = (v: any) => {
      if (v === undefined || v === null) return null;
      const clean = String(v).replace(/,/g, '').trim();
      if (clean === '--' || clean === '---' || clean === 'X' || clean === '') return null;
      const num = parseFloat(clean);
      return isNaN(num) ? null : num;
    };

    // Populate TWSE listed stocks
    for (const d of dayData) {
      if (!d.Code) continue;
      const code = d.Code.trim();
      const name = d.Name ? d.Name.trim() : "";
      
      const closingPrice = parseVal(d.ClosingPrice);
      const openingPrice = parseVal(d.OpeningPrice);
      const highestPrice = parseVal(d.HighestPrice);
      const lowestPrice = parseVal(d.LowestPrice);
      const priceChange = parseVal(d.PriceChange);
      const tradeVolume = parseVal(d.TradeVolume);
      const tradeValue = parseVal(d.TradeValue);

      let yesterdayClose = null;
      if (closingPrice !== null && priceChange !== null) {
        yesterdayClose = parseFloat((closingPrice - priceChange).toFixed(2));
      }

      let priceChangePercent = null;
      if (yesterdayClose && yesterdayClose > 0 && priceChange !== null) {
        priceChangePercent = parseFloat(((priceChange / yesterdayClose) * 100).toFixed(2));
      }

      const extra = bwbMap[code] || {};
      const peRatio = parseVal(extra.PEratio);
      const pbRatio = parseVal(extra.PBratio);
      const dividendYield = parseVal(extra.DividendYield);

      newCache[code] = {
        code,
        name,
        currentPrice: closingPrice,
        openPrice: openingPrice,
        highPrice: highestPrice,
        lowPrice: lowestPrice,
        yesterdayClose: yesterdayClose || closingPrice,
        priceChange: priceChange || 0,
        priceChangePercent: priceChangePercent || 0,
        volume: tradeVolume ? Math.floor(tradeVolume / 1000) : null, // converted to '張' (1,000 shares)
        turnover: tradeValue ? parseFloat((tradeValue / 100000000).toFixed(2)) : null, // converted to '億元'
        peRatio,
        pbRatio,
        dividendYield
      };
    }

    // 3. Fetch TPEx (OTC quotes)
    try {
      const resTpex = await fetch("https://openapi.tpex.org.tw/v1/tpexReport/AL_ALL");
      if (resTpex.ok) {
        const tpexData: any[] = await resTpex.json();
        console.log(`Fetched ${tpexData.length} OTC quotes from TPEx`);
        for (const t of tpexData) {
          const code = (t.SecuritiesCompanyCode || t.Code || t.SecuritiesCode || "").trim();
          if (!code) continue;
          
          const name = (t.CompanyName || t.Name || "").trim();
          const closingPrice = parseVal(t.Close || t.ClosingPrice);
          const openingPrice = parseVal(t.Open || t.OpeningPrice);
          const highestPrice = parseVal(t.High || t.HighestPrice);
          const lowestPrice = parseVal(t.Low || t.LowestPrice);
          const priceChange = parseVal(t.Change || t.PriceChange);
          const tradeVolume = parseVal(t.TradeVolume || t.Volume);
          const tradeValue = parseVal(t.TradeValue || t.Turnover);

          let yesterdayClose = null;
          if (closingPrice !== null && priceChange !== null) {
            yesterdayClose = parseFloat((closingPrice - priceChange).toFixed(2));
          }

          let priceChangePercent = null;
          if (yesterdayClose && yesterdayClose > 0 && priceChange !== null) {
            priceChangePercent = parseFloat(((priceChange / yesterdayClose) * 100).toFixed(2));
          }

          newCache[code] = {
            code,
            name,
            currentPrice: closingPrice,
            openPrice: openingPrice,
            highPrice: highestPrice,
            lowPrice: lowestPrice,
            yesterdayClose: yesterdayClose || closingPrice,
            priceChange: priceChange || 0,
            priceChangePercent: priceChangePercent || 0,
            volume: tradeVolume ? Math.floor(tradeVolume / 1000) : null,
            turnover: tradeValue ? parseFloat((tradeValue / 100000000).toFixed(2)) : null,
            peRatio: parseVal(t.PEratio || t.PE || t.PeRatio),
            pbRatio: parseVal(t.PBratio || t.PB || t.PbRatio),
            dividendYield: parseVal(t.DividendYield || t.Yield)
          };
        }
      }
    } catch (e) {
      console.warn("Failed to fetch TPEx OTC, continuing with TWSE only", e);
    }

    stockCache = newCache;
    lastFetchTime = Date.now();
    console.log(`Updated cache: ${Object.keys(stockCache).length} active Taiwan stocks successfully tracked.`);
  } catch (error) {
    console.error("Error in fetchTWSEData:", error);
  }
}

// Perform initial fetch
fetchTWSEData();

// Refresh from TWSE every 15 minutes (15 * 60 * 1000 ms)
setInterval(fetchTWSEData, 15 * 60 * 1000);

// API endpoint to retrieve all live pricing updates
app.get("/api/stocks", (req, res) => {
  res.json({
    success: true,
    lastUpdated: lastFetchTime,
    data: stockCache
  });
});

// Vite middleware for development vs static build files for production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
