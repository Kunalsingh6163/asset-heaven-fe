"use client";

import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { apiRequest } from "@/src/lib/apiClient";
import { formatCurrency, formatPercent } from "@/src/lib/format";
import { useAuthStore } from "@/src/store/authStore";
import type { StockHolding, StockSearchResult } from "@/src/types/api";

const today = dayjs();

const quoteName = (stock: StockSearchResult) =>
  stock.longName ?? stock.displayName ?? stock.shortName ?? stock.name ?? stock.symbol;

const quotePrice = (stock: StockSearchResult | null) =>
  Number(
    stock?.price ??
      stock?.currentPrice ??
      stock?.regularMarketPrice ??
      stock?.open ??
      0,
  );

export function AddStockForm({ onCreated }: { onCreated: () => void }) {
  const user = useAuthStore((state) => state.user);
  const userId = user?._id ?? user?.userId ?? "";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(
    null,
  );
  const [form, setForm] = useState({
    quantity: "1",
    transactionDate: today,
    transactionType: "buy" as "buy" | "sell",
  });
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quantity = Number(form.quantity || 0);
  const unitPrice = quotePrice(selectedStock);
  const totalValue = useMemo(
    () => Number((quantity * unitPrice).toFixed(2)),
    [quantity, unitPrice],
  );

  const updateQuantity = (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, quantity: event.target.value }));

  const searchStocks = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setError("Enter at least 2 characters to search stocks.");
      return;
    }

    setSearching(true);
    setMessage(null);
    setError(null);
    try {
      const response = await apiRequest<StockSearchResult[]>("/stocks", {
        method: "GET",
        params: { query: trimmedQuery, region: "IN", limit: 10 },
      });
      setResults(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to search stocks");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const addStock = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setMessage(null);
      setError(null);

      if (!userId) {
        setError("User id was not found in the active login session.");
        return;
      }

      if (!selectedStock) {
        setError("Select a stock from search results before adding it.");
        return;
      }

      if (!quantity || quantity <= 0) {
        setError("Enter a quantity greater than zero.");
        return;
      }

      if (!unitPrice || unitPrice <= 0) {
        setError("Selected stock does not include a valid market price.");
        return;
      }

      setLoading(true);
      try {
        await apiRequest<StockHolding>("/stocks", {
          method: "POST",
          body: JSON.stringify({
            userId,
            symbol: selectedStock.symbol,
            name: quoteName(selectedStock),
            quantity,
            price: unitPrice,
            currentPrice: unitPrice,
            exchange: selectedStock.exchange ?? "NSE",
            currency: selectedStock.currency ?? "INR",
            transactionDate: form.transactionDate.format("YYYY-MM-DD"),
            transactionType: form.transactionType,
            watchlist: false,
            notes: "Added manually from stock search",
            tags: ["manual", "search"],
          }),
        });
        setMessage("Stock transaction added");
        setForm((current) => ({ ...current, quantity: "1" }));
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add stock");
      } finally {
        setLoading(false);
      }
    },
    [
      form.transactionDate,
      form.transactionType,
      onCreated,
      quantity,
      selectedStock,
      unitPrice,
      userId,
    ],
  );

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
    >
      <Stack
        component="form"
        spacing={2}
        onSubmit={addStock}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <AssetIcon src="/icons/Stocks.png" size={28} />
          <Typography variant="h6">Add stock transaction</Typography>
        </Stack>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            fullWidth
            label="Search stock"
            placeholder="Reliance, TCS, HDFC..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AssetIcon src="/icons/Search%20icon.png" size={20} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="button"
            variant="outlined"
            onClick={() => void searchStocks()}
            disabled={searching}
            sx={{ minWidth: 120 }}
          >
            {searching ? <CircularProgress size={20} /> : "Search"}
          </Button>
        </Stack>

        {results.length ? (
          <List
            dense
            disablePadding
            sx={{
              border: "1px solid rgba(25, 118, 210, 0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {results.map((stock) => {
              const isSelected = selectedStock?.symbol === stock.symbol;
              const price = quotePrice(stock);

              return (
                <ListItemButton
                  key={stock.symbol}
                  selected={isSelected}
                  onClick={() => setSelectedStock(stock)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                    gap: 1,
                    alignItems: "center",
                    borderBottom: "1px solid rgba(25, 118, 210, 0.08)",
                    "&:last-of-type": { borderBottom: 0 },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                      <Typography sx={{ fontWeight: 900 }}>
                        {stock.symbol}
                      </Typography>
                      <Chip size="small" label={stock.exchange ?? "NSE"} />
                    </Stack>
                    <Typography color="text.secondary" noWrap>
                      {quoteName(stock)}
                    </Typography>
                  </Box>
                  <Stack sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
                    <Typography sx={{ fontWeight: 900 }}>
                      {formatCurrency(price, stock.currency ?? "INR")}
                    </Typography>
                    <Typography
                      sx={{
                        color:
                          Number(stock.changePercent ?? 0) >= 0
                            ? "primary.main"
                            : "secondary.main",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {formatPercent(stock.changePercent)}
                    </Typography>
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        ) : null}

        {selectedStock ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(25, 118, 210, 0.04)",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {selectedStock.symbol}
            </Typography>
            <Typography color="text.secondary">{quoteName(selectedStock)}</Typography>
          </Box>
        ) : null}

        <BoxGrid>
          <TextField
            required
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={updateQuantity}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
          <TextField
            label="Current price"
            value={
              selectedStock
                ? formatCurrency(unitPrice, selectedStock.currency ?? "INR")
                : ""
            }
            slotProps={{ input: { readOnly: true } }}
          />
        </BoxGrid>
        <BoxGrid>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Transaction date"
              value={form.transactionDate}
              maxDate={today}
              disableFuture
              onChange={(value: Dayjs | null) => {
                if (value) {
                  setForm((current) => ({ ...current, transactionDate: value }));
                }
              }}
              slotProps={{ textField: { required: true } }}
            />
          </LocalizationProvider>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={form.transactionType}
            onChange={(_, value: "buy" | "sell" | null) => {
              if (value) {
                setForm((current) => ({
                  ...current,
                  transactionType: value,
                }));
              }
            }}
          >
            <ToggleButton type="button" value="buy">
              Buy
            </ToggleButton>
            <ToggleButton type="button" value="sell">
              Sell
            </ToggleButton>
          </ToggleButtonGroup>
        </BoxGrid>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            gap: 1,
            alignItems: "center",
          }}
        >
          <Stack>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              Estimated value
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {formatCurrency(totalValue, selectedStock?.currency ?? "INR")}
            </Typography>
          </Stack>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedStock}
            endIcon={<AssetIcon src="/icons/Stocks.png" size={22} />}
          >
            {loading ? "Adding..." : "Add transaction"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

function BoxGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}
