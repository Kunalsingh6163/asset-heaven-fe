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
import { useExpenses } from "@/src/hooks/useExpenses";
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/format";

const today = new Date().toISOString().slice(0, 10);
const fallbackCategories = ["food", "shopping", "transport", "bills", "entertainment"];

export function ExpensesPage() {
  const { expenses, categories, summary, loading, saving, error, addExpense } =
    useExpenses();
  const availableCategories = categories.length ? categories : fallbackCategories;
  const [form, setForm] = useState({
    amount: "",
    category: "food",
    notes: "",
    expenseDate: today,
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
                Expenses
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                Uses `/api/expenses`, `/api/expenses/categories`, and
                `/api/expenses/summary` exactly as listed in the updated TSV.
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
                void addExpense({
                  amount: Number(form.amount),
                  category: form.category,
                  notes: form.notes || undefined,
                  expenseDate: form.expenseDate,
                });
              }}
            >
              <Typography variant="h6">Add expense</Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                required
                label="Amount"
                type="number"
                value={form.amount}
                onChange={updateField("amount")}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              />
              <TextField
                select
                required
                label="Category"
                value={form.category}
                onChange={updateField("category")}
              >
                {availableCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={updateField("notes")}
              />
              <TextField
                required
                label="Date"
                type="date"
                value={form.expenseDate}
                onChange={updateField("expenseDate")}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                endIcon={<AssetIcon src="/icons/expense_no_bg.png" size={22} />}
              >
                {saving ? "Adding..." : "Add expense"}
              </Button>
            </Stack>
          </Paper>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <StatCard label="Budget" value={formatCurrency(summary?.budget)} />
          <StatCard
            label="Spent"
            value={formatCurrency(summary?.totalExpenses)}
            accent="secondary.main"
          />
          <StatCard
            label="Remaining"
            value={formatCurrency(summary?.remainingAmount)}
          />
          <StatCard
            label="Spent percent"
            value={formatPercent(summary?.spentPercent ?? undefined)}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)", overflowX: "auto" }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Recent expenses</Typography>
            {loading ? <CircularProgress /> : null}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id ?? `${expense.category}-${expense.createdAt}`}>
                    <TableCell sx={{ fontWeight: 800 }}>{expense.category}</TableCell>
                    <TableCell>{expense.notes || "-"}</TableCell>
                    <TableCell>
                      {expense.expenseDate
                        ? new Date(expense.expenseDate).toLocaleDateString("en-IN")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
                {!expenses.length ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        No expenses found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              {formatNumber(summary?.expenseCount)} expense records in the current summary.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
