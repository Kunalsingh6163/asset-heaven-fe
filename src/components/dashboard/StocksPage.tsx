"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AddStockForm } from "@/src/components/dashboard/AddStockForm";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { useDashboardData } from "@/src/hooks/useDashboardData";
import { apiRequest } from "@/src/lib/apiClient";
import { formatCurrency, formatPercent } from "@/src/lib/format";
import type { StockHolding } from "@/src/types/api";

type StockListPayload =
  | StockHolding[]
  | {
      stocks?: StockHolding[];
      data?: StockHolding[];
      items?: StockHolding[];
      docs?: StockHolding[];
    };

const normalizeStocks = (payload?: StockListPayload): StockHolding[] => {
  if (Array.isArray(payload)) return payload;

  return (
    payload?.stocks ??
    payload?.data ??
    payload?.items ??
    payload?.docs ??
    []
  );
};

export function StocksPage() {
  const { summary, refresh: refreshSummary } = useDashboardData();
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const overall = summary?.overall;

  const loadStocks = useCallback(async () => {
    setStocksLoading(true);
    setStocksError(null);
    try {
      const response = await apiRequest<StockListPayload>("/stocks");
      setStocks(normalizeStocks(response.data));
    } catch (err) {
      setStocksError(
        err instanceof Error ? err.message : "Unable to load stock list",
      );
    } finally {
      setStocksLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadStocks);
  }, [loadStocks]);

  const handleCreated = useCallback(() => {
    void loadStocks();
    void refreshSummary();
  }, [loadStocks, refreshSummary]);

  return (
    <Container maxWidth="xl" sx={{ pt: 4 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.35fr 0.65fr" },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              border: "1px solid rgba(25, 118, 210, 0.08)",
              background:
                "linear-gradient(135deg, #ffffff 0%, #edf8ff 62%, #fff2ef 100%)",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 } }}>
                Stocks
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                Add, review, and track authenticated stock transactions from
                the backend stock portfolio APIs.
              </Typography>
            </Stack>
          </Paper>
          <AddStockForm onCreated={handleCreated} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <StatCard label="Invested" value={formatCurrency(overall?.totalInvestment)} />
          <StatCard
            label="Current value"
            value={formatCurrency(overall?.totalCurrentValue)}
          />
          <StatCard
            label="Return"
            value={formatPercent(overall?.totalProfitLossPercentage)}
            accent="secondary.main"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: "1px solid rgba(25, 118, 210, 0.08)",
            overflowX: "auto",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
            >
              <Typography variant="h6">All stock transactions</Typography>
              {stocksLoading ? <CircularProgress size={22} /> : null}
            </Stack>
            {stocksError ? <Alert severity="warning">{stocksError}</Alert> : null}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">P/L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stock, index) => (
                  <TableRow
                    key={
                      stock._id ??
                      `${stock.symbol}-${stock.transactionDate ?? index}`
                    }
                  >
                    <TableCell sx={{ fontWeight: 800 }}>{stock.symbol}</TableCell>
                    <TableCell>{stock.name ?? "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={stock.transactionType ?? "-"}
                        color={
                          stock.transactionType === "sell"
                            ? "secondary"
                            : "primary"
                        }
                        variant="outlined"
                        sx={{ textTransform: "capitalize", fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>{stock.transactionDate ?? "-"}</TableCell>
                    <TableCell align="right">{stock.quantity}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(stock.price, stock.currency)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(
                        stock.currentValue ??
                          stock.totalValue ??
                          stock.quantity * Number(stock.currentPrice ?? stock.price),
                        stock.currency,
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(stock.profitLoss, stock.currency)}
                    </TableCell>
                  </TableRow>
                ))}
                {!stocks.length ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography
                        color="text.secondary"
                        sx={{ py: 2, textAlign: "center" }}
                      >
                        No stocks found for this account.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
