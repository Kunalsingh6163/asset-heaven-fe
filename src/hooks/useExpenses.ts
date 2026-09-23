"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type { Expense, ExpenseSummary } from "@/src/types/api";

export type ExpenseInput = {
  amount: number;
  category: string;
  notes?: string;
  expenseDate: string;
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesResponse, expensesResponse, summaryResponse] =
        await Promise.all([
          apiRequest<string[]>("/expenses/categories"),
          apiRequest<Expense[]>("/expenses?page=1&limit=50"),
          apiRequest<ExpenseSummary>("/expenses/summary"),
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

  const runMutation = useCallback(
    async (request: () => Promise<unknown>, successMessage: string) => {
      setSaving(true);
      setError(null);
      setMessage(null);

      try {
        await request();
        setMessage(successMessage);
        await refresh();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update expenses");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const addExpense = useCallback(
    (payload: ExpenseInput) =>
      runMutation(
        () =>
          apiRequest<Expense>("/expenses", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
        "Expense added successfully",
      ),
    [runMutation],
  );

  const updateExpense = useCallback(
    (id: string, payload: ExpenseInput) =>
      runMutation(
        () =>
          apiRequest<Expense>(`/expenses/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          }),
        "Expense updated successfully",
      ),
    [runMutation],
  );

  const deleteExpense = useCallback(
    (id: string) =>
      runMutation(
        () =>
          apiRequest<Expense>(`/expenses/${encodeURIComponent(id)}`, {
            method: "DELETE",
          }),
        "Expense deleted successfully",
      ),
    [runMutation],
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
    message,
    refresh,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
