"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type {
  MarketHome,
  PortfolioSummaryResponse,
  StockHolding,
} from "@/src/types/api";

type DashboardState = {
  marketHome: MarketHome | null;
  stocks: StockHolding[];
  summary: PortfolioSummaryResponse | null;
};

const normalizeMarketHome = (home?: MarketHome) => home?.data ?? home ?? null;

export function useDashboardData() {
  const [data, setData] = useState<DashboardState>({
    marketHome: null,
    stocks: [],
    summary: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [homeResponse, stockResponse, summaryResponse] = await Promise.all([
        apiRequest<MarketHome>(
          "/market-data/home?region=IN&count=8&topShareCount=12",
        ),
        apiRequest<StockHolding[]>("/stocks?page=1&limit=6").catch(() => null),
        apiRequest<PortfolioSummaryResponse>("/stocks/summary").catch(
          () => null,
        ),
      ]);

      setData({
        marketHome: normalizeMarketHome(homeResponse.data),
        stocks: stockResponse?.data ?? [],
        summary: summaryResponse?.data ?? null,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { ...data, loading, error, refresh };
}
