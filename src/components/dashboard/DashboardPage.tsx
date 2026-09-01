"use client";

import {
  Alert,
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
import { MarketSection } from "@/src/components/dashboard/MarketSection";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { useDashboardData } from "@/src/hooks/useDashboardData";
import { formatCurrency, formatPercent } from "@/src/lib/format";
import { useAuthStore } from "@/src/store/authStore";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { marketHome, stocks, summary, loading, error, refresh } =
    useDashboardData();
  const overall = summary?.overall;

  return (
    <Box sx={{ pb: 2 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.75fr" },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                border: "1px solid rgba(25, 118, 210, 0.08)",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #edf8ff 60%, #fff2ef 100%)",
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="h3" sx={{ fontSize: { xs: 34, md: 46 } }}>
                  Good to see you, {user?.name?.split(" ")[0] ?? "Trader"}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                  JWT authentication is active. Market data is public, while
                  portfolio holdings and transactions are requested with your
                  Bearer access token.
                </Typography>
              </Stack>
            </Paper>
            <AddStockForm onCreated={() => void refresh()} />
          </Box>

          {error ? <Alert severity="warning">{error}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            <StatCard
              label="Invested"
              value={formatCurrency(overall?.totalInvestment)}
            />
            <StatCard
              label="Current value"
              value={formatCurrency(overall?.totalCurrentValue)}
            />
            <StatCard
              label="Profit / loss"
              value={formatCurrency(overall?.totalProfitLoss)}
              accent={
                Number(overall?.totalProfitLoss ?? 0) >= 0
                  ? "primary.main"
                  : "secondary.main"
              }
            />
            <StatCard
              label="Return"
              value={formatPercent(overall?.totalProfitLossPercentage)}
              accent="secondary.main"
            />
          </Box>

          {loading ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Paper>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <MarketSection
              title="Market indices"
              items={marketHome?.marketIndices}
            />
            <MarketSection title="Trending stocks" items={marketHome?.trendingStocks} />
            <MarketSection title="Top gainers" items={marketHome?.topGainers} />
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
              <Typography variant="h6">Your stock holdings</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Buy price</TableCell>
                    <TableCell align="right">Current value</TableCell>
                    <TableCell align="right">P/L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock._id ?? stock.symbol}>
                      <TableCell sx={{ fontWeight: 800 }}>{stock.symbol}</TableCell>
                      <TableCell>{stock.name ?? "-"}</TableCell>
                      <TableCell align="right">{stock.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(stock.price)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(stock.currentValue ?? stock.totalValue)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color:
                              Number(stock.profitLoss ?? 0) >= 0
                                ? "primary.main"
                                : "secondary.main",
                          }}
                        >
                          {formatCurrency(stock.profitLoss)}
                        </Typography>
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
                          No authenticated holdings returned yet.
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
    </Box>
  );
}
