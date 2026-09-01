"use client";

import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import type { MarketQuote } from "@/src/types/api";
import { formatCurrency, formatPercent, toNumber } from "@/src/lib/format";

const quotePrice = (quote: MarketQuote) =>
  toNumber(quote.regularMarketPrice) ??
  toNumber(quote.price) ??
  toNumber(quote.currentPrice);

const quoteChange = (quote: MarketQuote) =>
  toNumber(quote.regularMarketChangePercent) ?? toNumber(quote.changePercent);

const normalizeQuotes = (items: unknown): MarketQuote[] => {
  if (Array.isArray(items)) {
    return items as MarketQuote[];
  }

  if (items && typeof items === "object") {
    const section = items as { data?: unknown; results?: unknown; items?: unknown };

    if (Array.isArray(section.data)) {
      return section.data as MarketQuote[];
    }

    if (Array.isArray(section.results)) {
      return section.results as MarketQuote[];
    }

    if (Array.isArray(section.items)) {
      return section.items as MarketQuote[];
    }
  }

  return [];
};

export function MarketSection({
  title,
  items,
}: {
  title: string;
  items?: unknown;
}) {
  const quotes = normalizeQuotes(items);

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">{title}</Typography>
        <Stack spacing={1.25}>
          {quotes.slice(0, 5).map((quote, index) => {
            const change = quoteChange(quote);
            const positive = Number(change ?? 0) >= 0;

            return (
              <Box
                key={`${quote.symbol ?? quote.name ?? title}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 1.5,
                  alignItems: "center",
                  minHeight: 58,
                }}
              >
                <Avatar
                  src={quote.icon ?? quote.logo}
                  sx={{ bgcolor: positive ? "primary.light" : "secondary.light" }}
                >
                  {(quote.symbol ?? quote.name ?? "?").slice(0, 1)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800 }} noWrap>
                    {quote.symbol ?? quote.shortName ?? quote.name ?? "Market"}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 13 }} noWrap>
                    {quote.name ?? quote.shortName ?? quote.exchange ?? "Live quote"}
                  </Typography>
                </Box>
                <Stack spacing={0.5} sx={{ alignItems: "flex-end" }}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {formatCurrency(quotePrice(quote), quote.currency ?? "INR")}
                  </Typography>
                  <Chip
                    size="small"
                    color={positive ? "primary" : "secondary"}
                    icon={
                      positive ? (
                        <TrendingUpRoundedIcon />
                      ) : (
                        <TrendingDownRoundedIcon />
                      )
                    }
                    label={formatPercent(change)}
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>
              </Box>
            );
          })}
          {!quotes.length ? (
            <Typography color="text.secondary">No data available yet.</Typography>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
