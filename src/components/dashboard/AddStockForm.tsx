"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { apiRequest } from "@/src/lib/apiClient";
import type { StockHolding } from "@/src/types/api";

const today = new Date().toISOString().slice(0, 10);

export function AddStockForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    quantity: "1",
    price: "",
    transactionDate: today,
    transactionType: "buy",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateField =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
    >
      <Stack
        component="form"
        spacing={2}
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setMessage(null);
          setError(null);
          try {
            await apiRequest<StockHolding>("/stocks", {
              method: "POST",
              body: JSON.stringify({
                symbol: form.symbol.toUpperCase(),
                name: form.name,
                quantity: Number(form.quantity),
                price: Number(form.price),
                transactionDate: form.transactionDate,
                transactionType: form.transactionType,
              }),
            });
            setMessage("Stock transaction added");
            onCreated();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to add stock");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Typography variant="h6">Add stock transaction</Typography>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          required
          label="Symbol"
          placeholder="RELIANCE.NS"
          value={form.symbol}
          onChange={updateField("symbol")}
        />
        <TextField
          required
          label="Company name"
          value={form.name}
          onChange={updateField("name")}
        />
        <BoxGrid>
          <TextField
            required
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={updateField("quantity")}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
          <TextField
            required
            label="Price"
            type="number"
            value={form.price}
            onChange={updateField("price")}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
        </BoxGrid>
        <BoxGrid>
          <TextField
            required
            label="Date"
            type="date"
            value={form.transactionDate}
            onChange={updateField("transactionDate")}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Type"
            value={form.transactionType}
            onChange={updateField("transactionType")}
          >
            <MenuItem value="buy">Buy</MenuItem>
            <MenuItem value="sell">Sell</MenuItem>
          </TextField>
        </BoxGrid>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={<AssetIcon src="/icons/Stocks.png" size={22} />}
        >
          {loading ? "Adding..." : "Add transaction"}
        </Button>
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
