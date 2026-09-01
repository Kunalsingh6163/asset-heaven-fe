"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type { MutualFundHolding } from "@/src/types/api";

export function useMutualFunds() {
  const [holdings, setHoldings] = useState<MutualFundHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<MutualFundHolding[]>(
        "/mutual-fund-holdings?page=1&limit=50",
      );
      setHoldings(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load mutual funds",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addHolding = useCallback(
    async (payload: {
      fundName: string;
      schemeCode?: string;
      quantity: number;
      price: number;
      transactionDate: string;
      transactionType: "buy" | "sell";
    }) => {
      setSaving(true);
      setError(null);
      try {
        await apiRequest<MutualFundHolding>("/mutual-fund-holdings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to add mutual fund",
        );
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const totals = useMemo(
    () =>
      holdings.reduce(
        (acc, holding) => {
          acc.invested += Number(holding.investedAmount ?? 0);
          acc.current += Number(holding.currentValue ?? holding.investedAmount ?? 0);
          acc.count += 1;
          return acc;
        },
        { invested: 0, current: 0, count: 0 },
      ),
    [holdings],
  );

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { holdings, totals, loading, saving, error, refresh, addHolding };
}
