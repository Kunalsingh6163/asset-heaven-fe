"use client";

import {
  Alert,
  Box,
  Button,
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
  TextField,
  Typography,
} from "@mui/material";
import { AddStockForm } from "@/src/components/dashboard/AddStockForm";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { useDashboardData } from "@/src/hooks/useDashboardData";
import { formatCurrency, formatPercent } from "@/src/lib/format";
import { useAuthStore } from "@/src/store/authStore";

const indices = [
  { name: "NIFTY 50", value: "22,957.10", change: "+145.30 (0.64%)", positive: true },
  { name: "SENSEX", value: "75,552.89", change: "+512.31 (0.68%)", positive: true },
  { name: "BANK NIFTY", value: "48,512.35", change: "-120.45 (-0.25%)", positive: false },
  { name: "NIFTY IT", value: "34,832.40", change: "+256.75 (0.74%)", positive: true },
];

const watchlist = [
  ["RELIANCE", "Reliance Industries", "2,987.60", "+1.35%", "Buy"],
  ["HDFCBANK", "HDFC Bank", "1,678.85", "+0.82%", "Buy"],
  ["INFY", "Infosys", "1,512.40", "+1.12%", "Buy"],
  ["TCS", "Tata Consultancy", "3,693.25", "-0.36%", "Sell"],
  ["ICICIBANK", "ICICI Bank", "1,210.65", "+0.68%", "Buy"],
];

const positions = [
  ["RELIANCE", "10", "2,850.00", "2,987.60", "+1,376.00", "+4.83%"],
  ["INFY", "20", "1,480.00", "1,512.40", "+648.00", "+2.19%"],
  ["HDFCBANK", "15", "1,650.00", "1,678.85", "+432.75", "+1.75%"],
  ["TCS", "10", "3,750.00", "3,693.25", "-567.50", "-1.51%"],
];

const recentOrders = [
  ["10:12:45 AM", "HDFCBANK", "Buy", "15", "1,678.50", "Filled"],
  ["10:05:18 AM", "RELIANCE", "Sell", "10", "2,985.00", "Filled"],
  ["09:58:36 AM", "INFY", "Buy", "20", "1,510.00", "Pending"],
  ["09:45:11 AM", "ICICIBANK", "Sell", "25", "1,210.00", "Rejected"],
];

const allocation = [
  ["Financials", "38.0%", "#1976d2"],
  ["Technology", "26.5%", "#00acc1"],
  ["Energy", "15.6%", "#ffb300"],
  ["Consumer", "11.4%", "#7e57c2"],
  ["Cash", "8.5%", "#90a4ae"],
];

const movers = [
  ["BAJFINANCE", "7,102.95", "+2.89%"],
  ["MARUTI", "12,645.85", "+2.35%"],
  ["TITAN", "3,567.40", "+2.10%"],
  ["ASIANPAINT", "2,984.30", "+1.96%"],
  ["SUNPHARMA", "1,680.25", "+1.88%"],
];

const news = [
  ["RBI keeps repo rate unchanged at 6.50%, maintains withdrawal stance", "9:58 AM"],
  ["Reliance Industries Q4 profit rises on strong retail performance", "9:32 AM"],
  ["HDFC Bank board approves raising up to Rs 25,000 crore through bonds", "9:10 AM"],
  ["Indian IT companies see steady deal flow; margins remain under watch", "8:45 AM"],
  ["Global markets trade mixed ahead of PMI data; oil prices ease", "8:20 AM"],
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { stocks, summary, loading, error, refresh } = useDashboardData();
  const overall = summary?.overall;

  return (
    <Box sx={{ pb: 2 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid rgba(25, 118, 210, 0.08)",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto auto" },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              placeholder="Search stocks, ETFs, indices..."
              slotProps={{
                input: {
                  startAdornment: <AssetIcon src="/icons/Search%20icon.png" size={22} />,
                },
              }}
            />
            <Chip
              label="Market Open - 10:15 AM"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
            <Stack spacing={0.25}>
              <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>
                Available Funds
              </Typography>
              <Typography sx={{ fontWeight: 900 }}>Rs 1,25,430.50</Typography>
            </Stack>
          </Paper>

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
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {indices.map((item) => (
              <Paper
                key={item.name}
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid rgba(25, 118, 210, 0.08)",
                  overflow: "hidden",
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <AssetIcon
                    src={item.positive ? "/icons/top%20gainers.png" : "/icons/top%20losers.png"}
                    size={42}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900 }}>{item.name}</Typography>
                    <Typography variant="h5">{item.value}</Typography>
                    <Typography
                      sx={{
                        color: item.positive ? "primary.main" : "secondary.main",
                        fontWeight: 800,
                      }}
                    >
                      {item.change}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

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
              gridTemplateColumns: { xs: "1fr", xl: "1.2fr 0.8fr" },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">Portfolio Value</Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
                    gap: 2,
                  }}
                >
                  {[
                    ["Total Invested", "Rs 12,45,680.75"],
                    ["Current Value", "Rs 14,78,920.40"],
                    ["Today's P&L", "+Rs 18,745.60"],
                    ["Overall Returns", "+Rs 2,33,239.65"],
                    ["Available Cash", "Rs 1,25,430.50"],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box
                  sx={{
                    height: 210,
                    borderRadius: 2,
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 700 210"
                    preserveAspectRatio="none"
                    sx={{ width: "100%", height: "100%" }}
                  >
                    <defs>
                      <linearGradient id="portfolioFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#1976d2" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#1976d2" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 160 L55 148 L105 154 L155 136 L210 124 L265 139 L320 112 L375 96 L430 108 L485 124 L545 116 L605 97 L700 66"
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth="4"
                    />
                    <path
                      d="M0 160 L55 148 L105 154 L155 136 L210 124 L265 139 L320 112 L375 96 L430 108 L485 124 L545 116 L605 97 L700 66 L700 210 L0 210 Z"
                      fill="url(#portfolioFill)"
                    />
                  </Box>
                </Box>
              </Stack>
            </Paper>

            <TradingTable
              title="Watchlist"
              headers={["Symbol", "LTP", "Change", "Action"]}
              rows={watchlist.map(([symbol, name, ltp, change, action]) => [
                <Box key={symbol}>
                  <Typography sx={{ fontWeight: 900 }}>{symbol}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                    {name}
                  </Typography>
                </Box>,
                ltp,
                <PositiveValue key={change} value={change} />,
                <Button key={action} size="small" variant="outlined">
                  {action}
                </Button>,
              ])}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1fr 1fr" },
              gap: 2,
            }}
          >
            <AllocationCard />
            <TradingTable
              title="Open Positions"
              headers={["Symbol", "Qty", "Avg", "LTP", "P&L"]}
              rows={positions.map(([symbol, qty, avg, ltp, pnl]) => [
                symbol,
                qty,
                avg,
                ltp,
                <PositiveValue key={pnl} value={pnl} />,
              ])}
            />
            <TradingTable
              title="Recent Orders"
              headers={["Time", "Symbol", "Type", "Qty", "Status"]}
              rows={recentOrders.map(([time, symbol, type, qty, , status]) => [
                time,
                symbol,
                <Chip key={type} size="small" label={type} color={type === "Buy" ? "primary" : "secondary"} />,
                qty,
                <Chip key={status} size="small" label={status} variant="outlined" />,
              ])}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "0.8fr 1.2fr" },
              gap: 2,
            }}
          >
            <TradingTable
              title="Market Movers"
              headers={["Symbol", "LTP", "Change"]}
              rows={movers.map(([symbol, ltp, change]) => [
                symbol,
                ltp,
                <PositiveValue key={change} value={change} />,
              ])}
            />
            <TradingTable
              title="Market News"
              headers={["Headline", "Time"]}
              rows={news.map(([headline, time]) => [
                <Stack key={headline} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <AssetIcon src="/icons/repo%20rate%20rbi.png" size={22} />
                  <Typography>{headline}</Typography>
                </Stack>,
                time,
              ])}
            />
          </Box>

          <HoldingsTable stocks={stocks} />
        </Stack>
      </Container>
    </Box>
  );
}

function PositiveValue({ value }: { value: string }) {
  const positive = !value.trim().startsWith("-");

  return (
    <Typography
      component="span"
      sx={{
        color: positive ? "primary.main" : "secondary.main",
        fontWeight: 900,
      }}
    >
      {value}
    </Typography>
  );
}

function TradingTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
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
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">{title}</Typography>
          <Button size="small">View All</Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
}

function AllocationCard() {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">Holdings</Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 132,
              height: 132,
              borderRadius: "50%",
              background:
                "conic-gradient(#1976d2 0 38%, #00acc1 38% 64.5%, #ffb300 64.5% 80.1%, #7e57c2 80.1% 91.5%, #90a4ae 91.5% 100%)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                bgcolor: "#ffffff",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>Rs 14.78L</Typography>
            </Box>
          </Box>
          <Stack spacing={1} sx={{ flex: 1 }}>
            {allocation.map(([label, percent, color]) => (
              <Stack
                key={label}
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
                  <Typography>{label}</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 800 }}>{percent}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function HoldingsTable({ stocks }: { stocks: ReturnType<typeof useDashboardData>["stocks"] }) {
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
                <TableCell align="right">{formatCurrency(stock.price)}</TableCell>
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
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    No authenticated holdings returned yet.
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
