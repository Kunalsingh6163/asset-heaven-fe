"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import {
  getMarketData,
  refreshMarketData,
  type MarketDataItem,
} from "@/src/api/marketData";
import { formatNumber, toNumber } from "@/src/lib/format";

const MARKET_REFRESH_INTERVAL_MS = 60_000;

const signedNumber = (value?: number) => {
  const number = Number(value ?? 0);
  const prefix = number > 0 ? "+" : "";

  return `${prefix}${formatNumber(number)}`;
};

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const formatMarketTime = (value?: string) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

function Indices() {
  const [indices, setIndices] = useState<MarketDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let inFlight = false;

    const loadMarketData = async (refreshFirst = false) => {
      if (inFlight) return;

      inFlight = true;

      if (mounted) {
        if (hasLoadedDataRef.current) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
      }

      try {
        let refreshError: string | null = null;

        if (refreshFirst) {
          try {
            await refreshMarketData();
          } catch (err) {
            refreshError = getErrorMessage(err, "Live refresh failed");
          }
        }

        const marketData = await getMarketData();

        if (mounted) {
          setIndices(marketData);
          hasLoadedDataRef.current = true;
          setError(
            refreshError ? `Live refresh failed: ${refreshError}` : null,
          );
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err, "Unable to load market data"));
        }
      } finally {
        inFlight = false;

        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void loadMarketData();
    const intervalId = setInterval(() => {
      void loadMarketData();
    }, MARKET_REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 900 }}>
          Market data
        </Typography>
        {loading || refreshing ? <CircularProgress size={16} /> : null}
      </Stack>

      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(indices.length, 5)}, minmax(168px, 1fr))`,
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        {indices.map((item) => {
          const change = toNumber(item.change);
          const changePercent = toNumber(item.changePercent);
          const positive = Number(change ?? 0) >= 0;
          const marketTime = formatMarketTime(item.marketTime);
          const changeLabel = `${signedNumber(change)} (${signedNumber(
            changePercent,
          )}%)`;

          return (
            <Paper
              key={item.key ?? item.symbol ?? item.displayName}
              elevation={0}
              sx={{
                p: 1.25,
                border: "1px solid rgba(25, 118, 210, 0.08)",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <AssetIcon
                  src={
                    positive
                      ? "/icons/top%20gainers.png"
                      : "/icons/top%20losers.png"
                  }
                  size={30}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: 12, fontWeight: 900 }}>
                    {item.displayName ?? item.symbol ?? "Market"}
                  </Typography>
                  <Typography sx={{ fontSize: 19, fontWeight: 900 }}>
                    {formatNumber(toNumber(item.price))}
                  </Typography>
                  <Typography
                    sx={{
                      color: positive ? "primary.main" : "secondary.main",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {changeLabel}
                  </Typography>
                  <Typography
                    noWrap
                    color="text.secondary"
                    sx={{ fontSize: 11 }}
                  >
                    {item.exchange ?? item.type ?? "Market"}
                    {item.marketState ? ` - ${item.marketState}` : ""}
                    {marketTime ? ` - ${marketTime}` : ""}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                    H {formatNumber(toNumber(item.dayHigh))} / L{" "}
                    {formatNumber(toNumber(item.dayLow))}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Box>

      {!loading && !error && !indices.length ? (
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          No market data returned yet.
        </Typography>
      ) : null}
    </Stack>
  );
}

export default Indices;
