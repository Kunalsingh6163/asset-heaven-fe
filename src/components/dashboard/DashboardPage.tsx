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
import { StatCard } from "@/src/components/dashboard/StatCard";
import { useDashboardData } from "@/src/hooks/useDashboardData";
import { formatCurrency, formatPercent } from "@/src/lib/format";
import { useAuthStore } from "@/src/store/authStore";
import Indices from "./Indices";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { stocks, summary, loading, error, refresh } = useDashboardData();
  const overall = summary?.overall;

  return (
    <Box sx={{ pb: 2 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Stack spacing={3}>
          <Indices />

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
                  Good to see you, {user?.name?.split(" ")[0] ?? "Investor"}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                  Your portfolio figures and holdings below come from your authenticated account.
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
            <StatCard label="Invested" value={formatCurrency(overall?.totalInvestment)} />
            <StatCard label="Current value" value={formatCurrency(overall?.totalCurrentValue)} />
            <StatCard
              label="Profit / loss"
              value={formatCurrency(overall?.totalProfitLoss)}
              accent={Number(overall?.totalProfitLoss ?? 0) >= 0 ? "primary.main" : "secondary.main"}
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
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <ComingSoonCard
              title="Performance chart"
              description="Historical portfolio snapshots are needed before this chart can show real values."
            />
            <ComingSoonCard
              title="Allocation"
              description="Asset allocation will appear when portfolio-category holdings are connected."
            />
            <ComingSoonCard
              title="Watchlist"
              description="Watchlist management will appear when it is connected to this dashboard."
            />
            <ComingSoonCard
              title="Order history"
              description="Broker order history is not available from the current backend."
            />
          </Box>

          <HoldingsTable stocks={stocks} />
        </Stack>
      </Container>
    </Box>
  );
}

function ComingSoonCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        minHeight: 152,
        border: "1px solid rgba(25, 118, 210, 0.08)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack spacing={0.75}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        <Typography color="primary.main" sx={{ fontSize: 13, fontWeight: 800 }}>
          Coming soon
        </Typography>
      </Stack>
    </Paper>
  );
}

function HoldingsTable({
  stocks,
}: {
  stocks: ReturnType<typeof useDashboardData>["stocks"];
}) {
  return (
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
                  {formatCurrency(stock.price, stock.currency)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(stock.currentValue ?? stock.totalValue, stock.currency)}
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
                    {formatCurrency(stock.profitLoss, stock.currency)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {!stocks.length ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    No stock transactions have been added yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
}
