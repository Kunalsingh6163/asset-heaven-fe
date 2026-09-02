"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
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
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { useMutualFunds } from "@/src/hooks/useMutualFunds";
import { formatCurrency, formatNumber } from "@/src/lib/format";

const today = new Date().toISOString().slice(0, 10);

export function MutualFundsPage() {
  const { holdings, totals, loading, saving, error, addHolding } =
    useMutualFunds();
  const [form, setForm] = useState({
    fundName: "",
    schemeCode: "",
    quantity: "",
    price: "",
    transactionDate: today,
    transactionType: "buy" as "buy" | "sell",
  });

  const updateField =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <Container maxWidth="xl" sx={{ pt: 4 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" },
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
                Mutual Funds
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                Uses `/api/mutual-fund-holdings` for authenticated manual
                holdings and accepts quantity/price aliases from the backend.
              </Typography>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
          >
            <Stack
              component="form"
              spacing={2}
              onSubmit={(event) => {
                event.preventDefault();
                void addHolding({
                  fundName: form.fundName,
                  schemeCode: form.schemeCode || undefined,
                  quantity: Number(form.quantity),
                  price: Number(form.price),
                  transactionDate: form.transactionDate,
                  transactionType: form.transactionType,
                });
              }}
            >
              <Typography variant="h6">Add mutual fund holding</Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                required
                label="Fund name"
                value={form.fundName}
                onChange={updateField("fundName")}
              />
              <TextField
                label="Scheme code"
                value={form.schemeCode}
                onChange={updateField("schemeCode")}
              />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <TextField
                  required
                  label="Units"
                  type="number"
                  value={form.quantity}
                  onChange={updateField("quantity")}
                  slotProps={{ htmlInput: { min: 0, step: 0.001 } }}
                />
                <TextField
                  required
                  label="Purchase NAV"
                  type="number"
                  value={form.price}
                  onChange={updateField("price")}
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
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
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                endIcon={<AssetIcon src="/icons/Mutual%20Funds.png" size={22} />}
              >
                {saving ? "Adding..." : "Add holding"}
              </Button>
            </Stack>
          </Paper>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <StatCard label="Holdings" value={formatNumber(totals.count)} />
          <StatCard label="Invested" value={formatCurrency(totals.invested)} />
          <StatCard
            label="Current value"
            value={formatCurrency(totals.current)}
            accent="secondary.main"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)", overflowX: "auto" }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Mutual fund holdings</Typography>
            {loading ? <CircularProgress /> : null}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fund</TableCell>
                  <TableCell>Scheme</TableCell>
                  <TableCell align="right">Units</TableCell>
                  <TableCell align="right">Invested</TableCell>
                  <TableCell align="right">Current value</TableCell>
                  <TableCell align="right">P/L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding._id ?? holding.fundName}>
                    <TableCell sx={{ fontWeight: 800 }}>{holding.fundName}</TableCell>
                    <TableCell>{holding.schemeCode ?? "-"}</TableCell>
                    <TableCell align="right">
                      {formatNumber(holding.units ?? holding.quantity)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(holding.investedAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(
                        holding.currentValue ?? holding.investedAmount,
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {holding.profitLoss == null
                        ? "-"
                        : formatCurrency(holding.profitLoss)}
                    </TableCell>
                  </TableRow>
                ))}
                {!holdings.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        No mutual fund holdings found.
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
