/**
 * API Service - Backend se data fetch karta hai
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Market Data APIs
  async getQuote(symbol: string, exchange: string = 'NSE') {
    return this.request<any>(`/market/quote/${symbol}?exchange=${exchange}`);
  }

  async getQuotes(symbols: string[], exchange: string = 'NSE') {
    return this.request<any>(`/market/quotes?symbols=${symbols.join(',')}&exchange=${exchange}`);
  }

  async getHistoricalData(
    symbol: string,
    timeframe: string = '15m',
    fromDate?: string,
    toDate?: string
  ) {
    const params = new URLSearchParams({ timeframe });
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    
    return this.request<any>(`/market/history/${symbol}?${params.toString()}`);
  }

  // Trading APIs
  async getStrategies() {
    return this.request<any>('/strategies');
  }

  async getOrders() {
    return this.request<any>('/orders');
  }

  async getPositions() {
    return this.request<any>('/positions');
  }

  async getPortfolio() {
    return this.request<any>('/portfolio');
  }

  async placeOrder(order: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Bot Control
  async startBot() {
    return this.request<any>('/trading/start', { method: 'POST' });
  }

  async stopBot() {
    return this.request<any>('/trading/stop', { method: 'POST' });
  }

  async emergencyStop() {
    return this.request<any>('/trading/emergency-stop', { method: 'POST' });
  }

  // Health Check
  async healthCheck() {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService();
