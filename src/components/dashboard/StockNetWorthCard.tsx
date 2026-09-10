"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  type NetWorthRange,
  useStockNetWorth,
} from "@/src/hooks/useStockNetWorth";
import { formatCurrency, formatPercent } from "@/src/lib/format";
import type { StockNetWorth, StockNetWorthHistoryPoint } from "@/src/types/api";

const rangeOptions: Array<{ value: NetWorthRange; label: string }> = [
  { value: "1w", label: "1 Week" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "3y", label: "3 Years" },
];

type ChartPoint = { label: string; value: number };

const dateLabel = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
      }).format(date);
};

const historyToPoints = (netWorth: StockNetWorth): ChartPoint[] => {
  const history = netWorth.history ?? netWorth.netWorthHistory ?? [];

  return history.reduce<ChartPoint[]>((points, entry: StockNetWorthHistoryPoint) => {
    const value = entry.value ?? entry.netWorth ?? entry.totalNetWorth;
    if (typeof value !== "number" || !Number.isFinite(value)) return points;

    points.push({
      value,
      label: dateLabel(entry.date ?? entry.timestamp),
    });
    return points;
  }, []);
};

function NetWorthLineChart({ netWorth }: { netWorth: StockNetWorth }) {
  const points = historyToPoints(netWorth);

  if (points.length < 2) {
    return (
      <Box
        sx={{
          height: 250,
          borderRadius: 2,
          border: "1px dashed rgba(25, 118, 210, 0.28)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Stack spacing={0.75} sx={{ alignItems: "center" }}>
          <Typography sx={{ color: "primary.main", fontWeight: 900 }}>
            {formatCurrency(netWorth.totalNetWorth, netWorth.currency)}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Current net worth as of {dateLabel(netWorth.calculatedAt)}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            Historical chart points will appear when the API returns history for
            the selected period.
          </Typography>
        </Stack>
      </Box>
    );
  }

  const width = 720;
  const height = 250;
  const padding = { top: 20, right: 16, bottom: 34, left: 16 };
  const values = points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const valueRange = maximum - minimum || Math.max(maximum * 0.05, 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const coordinates = points.map((point, index) => ({
    x: padding.left + (index / (points.length - 1)) * plotWidth,
    y: padding.top + (1 - (point.value - minimum) / valueRange) * plotHeight,
    ...point,
  }));
  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${padding.left},${height - padding.bottom} ${line} ${width - padding.right},${height - padding.bottom}`;

  return (
    <Box sx={{ height: 250 }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Stock net worth trend"
        sx={{ display: "block", height: "100%", width: "100%" }}
      >
        <defs>
          <linearGradient id="stockNetWorthFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1976d2" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1976d2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((step) => (
          <line
            key={step}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotHeight * step}
            y2={padding.top + plotHeight * step}
            stroke="rgba(25, 118, 210, 0.1)"
          />
        ))}
        <polygon points={area} fill="url(#stockNetWorthFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#1976d2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {coordinates.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} fill="#fff" r="4" stroke="#1976d2" strokeWidth="3" />
            {(index === 0 || index === coordinates.length - 1) && point.label ? (
              <text x={point.x} y={height - 10} fill="#64748b" fontSize="12" textAnchor={index === 0 ? "start" : "end"}>
                {point.label}
              </text>
            ) : null}
          </g>
        ))}
      </Box>
    </Box>
  );
}

export function StockNetWorthCard() {
  const [range, setRange] = useState<NetWorthRange>("1w");
  const { netWorth, loading, error } = useStockNetWorth(range);

  return (
    <StockNetWorthContent
      range={range}
      setRange={setRange}
      netWorth={netWorth}
      loading={loading}
      error={error}
    />
  );
}

function StockNetWorthContent({
  range,
  setRange,
  netWorth,
  loading,
  error,
}: {
  range: NetWorthRange;
  setRange: (range: NetWorthRange) => void;
  netWorth: StockNetWorth | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid rgba(25, 118, 210, 0.08)" }}>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Stock net worth</Typography>
            <Typography color="text.secondary" variant="body2">Portfolio value across your stock holdings</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 132 }}>
            <Select value={range} onChange={(event) => setRange(event.target.value as NetWorthRange)} inputProps={{ "aria-label": "Net worth chart period" }}>
              {rangeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        {loading ? <Box sx={{ height: 250, display: "grid", placeItems: "center" }}><CircularProgress size={28} /></Box> : null}
        {error ? <Alert severity="warning">{error}</Alert> : null}
        {!loading && !error && netWorth ? <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 4 }}>
            <Box><Typography color="text.secondary" variant="body2">Total net worth</Typography><Typography variant="h4" sx={{ fontWeight: 900 }}>{formatCurrency(netWorth.totalNetWorth, netWorth.currency)}</Typography></Box>
            <Box><Typography color="text.secondary" variant="body2">Total return</Typography><Typography sx={{ color: netWorth.totalProfitLoss >= 0 ? "primary.main" : "secondary.main", fontSize: 20, fontWeight: 900 }}>{formatCurrency(netWorth.totalProfitLoss, netWorth.currency)} ({formatPercent(netWorth.totalProfitLossPercentage)})</Typography></Box>
          </Stack>
          <NetWorthLineChart netWorth={netWorth} />
          <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}><Typography color="text.secondary" variant="caption">Invested: {formatCurrency(netWorth.totalInvestedValue, netWorth.currency)}</Typography><Typography color="text.secondary" variant="caption">{netWorth.holdingsCount} holdings · {netWorth.totalQuantity} units</Typography></Stack>
        </> : null}
      </Stack>
    </Paper>
  );
}
