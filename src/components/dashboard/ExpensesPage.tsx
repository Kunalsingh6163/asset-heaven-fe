"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { useExpenses, type ExpenseInput } from "@/src/hooks/useExpenses";
import { formatCurrency, formatNumber } from "@/src/lib/format";
import type { Expense } from "@/src/types/api";

const today = new Date().toISOString().slice(0, 10);

const toForm = (expense?: Expense | null): ExpenseInput => ({
  amount: expense?.amount ?? 0,
  category: expense?.category ?? "",
  notes: expense?.notes ?? "",
  expenseDate: expense?.expenseDate
    ? new Date(expense.expenseDate).toISOString().slice(0, 10)
    : today,
});

export function ExpensesPage() {
  const {
    expenses,
    categories,
    summary,
    loading,
    saving,
    error,
    message,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();
  const [form, setForm] = useState({
    amount: "",
    category: "",
    notes: "",
    expenseDate: today,
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<ExpenseInput>(toForm());
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const selectedCategory = form.category || categories[0] || "";

  const updateField =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateEditField =
    (field: keyof ExpenseInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((current) => ({
        ...current,
        [field]:
          field === "amount" ? Number(event.target.value) : event.target.value,
      }));

  const submitNewExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const created = await addExpense({
      amount: Number(form.amount),
      category: selectedCategory,
      notes: form.notes.trim() || undefined,
      expenseDate: form.expenseDate,
    });

    if (created) {
      setForm((current) => ({ ...current, amount: "", notes: "" }));
    }
  };

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingExpense?._id) return;

    const updated = await updateExpense(editingExpense._id, {
      ...editForm,
      notes: editForm.notes?.trim() || undefined,
    });

    if (updated) {
      setEditingExpense(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    const deleted = await deleteExpense(deleteTarget._id);
    if (deleted) {
      setDeleteTarget(null);
    }
  };

  const topCategory = summary?.categoryBreakdown?.[0];

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
                Add, update, and remove your expense records. Totals and categories come from your authenticated account.
              </Typography>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: 2.5, border: "1px solid rgba(25, 118, 210, 0.08)" }}
          >
            <Stack component="form" spacing={2} onSubmit={submitNewExpense}>
              <Typography variant="h6">Add expense</Typography>
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
                value={selectedCategory}
                onChange={updateField("category")}
                disabled={loading || !categories.length}
                helperText={
                  loading
                    ? "Loading categories..."
                    : !categories.length
                      ? "Categories are unavailable."
                      : undefined
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={updateField("notes")}
                slotProps={{ htmlInput: { maxLength: 500 } }}
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
                disabled={
                  saving || loading || !selectedCategory || Number(form.amount) <= 0
                }
                endIcon={<AssetIcon src="/icons/expense_no_bg.png" size={22} />}
              >
                {saving ? "Saving..." : "Add expense"}
              </Button>
            </Stack>
          </Paper>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <StatCard
            label="Total spent"
            value={formatCurrency(summary?.totalExpenses)}
            accent="secondary.main"
          />
          <StatCard label="Expense records" value={formatNumber(summary?.expenseCount)} />
          <StatCard
            label="Top category"
            value={topCategory ? topCategory.category : "No expenses yet"}
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
                  <TableCell align="right">Actions</TableCell>
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
                    <TableCell align="right">
                      <IconButton
                        aria-label="Edit expense"
                        disabled={saving || !expense._id}
                        onClick={() => {
                          setEditingExpense(expense);
                          setEditForm(toForm(expense));
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="Delete expense"
                        color="error"
                        disabled={saving || !expense._id}
                        onClick={() => setDeleteTarget(expense)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && !expenses.length ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        No expenses found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Stack>
        </Paper>
      </Stack>

      <Dialog
        open={Boolean(editingExpense)}
        onClose={() => !saving && setEditingExpense(null)}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={submitEdit}>
          <DialogTitle>Edit expense</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                required
                label="Amount"
                type="number"
                value={editForm.amount}
                onChange={updateEditField("amount")}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              />
              <TextField
                select
                required
                label="Category"
                value={editForm.category}
                onChange={updateEditField("category")}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notes"
                value={editForm.notes ?? ""}
                onChange={updateEditField("notes")}
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
              <TextField
                required
                label="Date"
                type="date"
                value={editForm.expenseDate}
                onChange={updateEditField("expenseDate")}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button disabled={saving} onClick={() => setEditingExpense(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !editForm.category || editForm.amount <= 0}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !saving && setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete expense?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently delete the selected expense record.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={saving} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" disabled={saving} onClick={() => void confirmDelete()}>
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
