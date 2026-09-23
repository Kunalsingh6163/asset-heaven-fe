import { apiRequest } from "@/src/api/client";

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
  const response = await apiRequest<MarketDataItem[]>("/indices", {
    skipAuth: true,
  });

  return response.data ?? [];
};

export const refreshMarketData = async () =>
  apiRequest<MarketDataRefreshResponse>("/market-data/refresh", {
    method: "POST",
  });
