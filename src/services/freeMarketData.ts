/**
 * Free Market Data APIs - No broker account required
 * 
 * Options:
 * 1. Yahoo Finance (via RapidAPI) - Free tier available
 * 2. Alpha Vantage - Free API key
 * 3. Twelve Data - Free tier
 * 4. NSE India RSS feeds (unofficial)
 */

// NSE India RSS Feed (Free, no API key needed)
export async function fetchNSEData(symbol: string): Promise<any> {
  try {
    // NSE doesn't have public API, but we can use proxy services
    const response = await fetch(
      `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) throw new Error('NSE API failed');
    
    const data = await response.json();
    return {
      symbol: data.symbol,
      ltp: data.priceInfo?.lastPrice || data.priceInfo?.intraDayHighLow?.max,
      change: data.priceInfo?.change,
      changePercent: data.priceInfo?.pChange,
      volume: data.priceInfo?.totalTradedVolume?.value,
      open: data.priceInfo?.open,
      high: data.priceInfo?.intraDayHighLow?.max,
      low: data.priceInfo?.intraDayHighLow?.min,
      close: data.priceInfo?.close,
    };
  } catch (error) {
    console.error('NSE fetch error:', error);
    return null;
  }
}

// Alpha Vantage API (Free API key required)
export async function fetchAlphaVantage(
  symbol: string,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${apiKey}`
    );
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    return {
      symbol: symbol,
      ltp: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent']),
      volume: parseInt(quote['06. volume']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      close: parseFloat(quote['08. previous close']),
    };
  } catch (error) {
    console.error('Alpha Vantage error:', error);
    return null;
  }
}

// Yahoo Finance via RapidAPI (Free tier)
export async function fetchYahooFinance(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbol}.NS`,
      {
        headers: {
          'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Get free key from rapidapi.com
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
      }
    );
    
    const data = await response.json();
    const quote = data.body?.[0] || data;
    
    return {
      symbol: symbol,
      ltp: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      close: quote.regularMarketPreviousClose,
    };
  } catch (error) {
    console.error('Yahoo Finance error:', error);
    return null;
  }
}

// Twelve Data API (Free tier - 800 calls/day)
export async function fetchTwelveData(
  symbol: string,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
    );
    
    const data = await response.json();
    
    return {
      symbol: data.symbol,
      ltp: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      volume: parseInt(data.volume),
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      close: parseFloat(data.close),
    };
  } catch (error) {
    console.error('Twelve Data error:', error);
    return null;
  }
}

/**
 * Get real market data from available free sources
 */
export async function getRealMarketData(symbol: string): Promise<any> {
  // Try multiple sources in order
  
  // 1. Try Alpha Vantage (if API key available)
  const alphaVantageKey = (import.meta as any).env?.VITE_ALPHA_VANTAGE_KEY;
  if (alphaVantageKey) {
    const data = await fetchAlphaVantage(symbol, alphaVantageKey);
    if (data) return data;
  }
  
  // 2. Try Twelve Data (if API key available)
  const twelveDataKey = (import.meta as any).env?.VITE_TWELVE_DATA_KEY;
  if (twelveDataKey) {
    const data = await fetchTwelveData(symbol, twelveDataKey);
    if (data) return data;
  }
  
  // 3. Try Yahoo Finance (if RapidAPI key available)
  const rapidApiKey = (import.meta as any).env?.VITE_RAPIDAPI_KEY;
  if (rapidApiKey) {
    const data = await fetchYahooFinance(symbol);
    if (data) return data;
  }
  
  // 4. Fallback to mock data
  console.warn('No real data source available, using mock data');
  return null;
}
