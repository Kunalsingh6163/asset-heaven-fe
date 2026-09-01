"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type { Expense, ExpenseSummary } from "@/src/types/api";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesResponse, expensesResponse, summaryResponse] =
        await Promise.all([
          apiRequest<string[]>("/expenses/categories", { skipAuth: true }),
          apiRequest<Expense[]>("/expenses?page=1&limit=50"),
          apiRequest<ExpenseSummary>("/expenses/summary?budget=50000"),
        ]);

      setCategories(categoriesResponse.data ?? []);
      setExpenses(expensesResponse.data ?? []);
      setSummary(summaryResponse.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = useCallback(
    async (payload: {
      amount: number;
      category: string;
      notes?: string;
      expenseDate: string;
    }) => {
      setSaving(true);
      setError(null);
      try {
        await apiRequest<Expense>("/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add expense");
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return {
    expenses,
    categories,
    summary,
    loading,
    saving,
    error,
    refresh,
    addExpense,
  };
}
