import { apiRequest } from "@/src/api/client";

const MARKET_DATA_URL = "https://mobulous-tech.vercel.app/api/market-data";
const MARKET_DATA_REFRESH_URL =
  "https://mobulous-tech.vercel.app/api/market-data/refresh";

export type MarketDataItem = {
  key?: string;
  symbol?: string;
  displayName?: string;
  type?: string;
  exchange?: string;
  currency?: string;
  country?: string;
  marketState?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  dayHigh?: number;
  dayLow?: number;
  marketTime?: string;
};

type MarketDataRefreshResponse = {
  count?: number;
  source?: string;
  refreshedAt?: string;
};

export const getMarketData = async () => {
  const response = await apiRequest<MarketDataItem[]>(MARKET_DATA_URL, {
    skipAuth: true,
  });

  return response.data ?? [];
};

export const refreshMarketData = async () =>
  apiRequest<MarketDataRefreshResponse>(MARKET_DATA_REFRESH_URL, {
    method: "POST",
  });
