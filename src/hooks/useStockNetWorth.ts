"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type { StockNetWorth } from "@/src/types/api";

export type NetWorthRange = "1w" | "3m" | "6m" | "1y" | "3y";

const periodByRange: Record<NetWorthRange, string> = {
  "1w": "weekly",
  "3m": "3months",
  "6m": "6months",
  "1y": "1year",
  "3y": "3years",
};

export function useStockNetWorth(range: NetWorthRange) {
  const [netWorth, setNetWorth] = useState<StockNetWorth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<StockNetWorth>(
        `/stocks/net-worth?period=${periodByRange[range]}`,
      );
      if (!response.success) {
        throw new Error(response.message ?? "Unable to load stock net worth");
      }
      setNetWorth(response.data ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load stock net worth",
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { netWorth, loading, error, refresh };
}
