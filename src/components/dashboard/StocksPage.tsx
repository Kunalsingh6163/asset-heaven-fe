"use client";

import {
  Box,
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
import { formatCurrency, formatPercent } from "@/src/lib/format";

export function StocksPage() {
  const { stocks, summary, loading, refresh } = useDashboardData();
  const overall = summary?.overall;

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
          <AddStockForm onCreated={() => void refresh()} />
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
            <Typography variant="h6">Stock transactions</Typography>
            {loading ? <CircularProgress /> : null}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">P/L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={stock._id ?? stock.symbol}>
                    <TableCell sx={{ fontWeight: 800 }}>{stock.symbol}</TableCell>
                    <TableCell>{stock.name ?? "-"}</TableCell>
                    <TableCell align="right">{stock.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(stock.price)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(stock.currentValue ?? stock.totalValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(stock.profitLoss)}
                    </TableCell>
                  </TableRow>
                ))}
                {!stocks.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
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
