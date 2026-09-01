"use client";

import { Paper, Stack, Typography } from "@mui/material";

export function StatCard({
  label,
  value,
  accent = "primary.main",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid rgba(25, 118, 210, 0.08)",
        height: "100%",
      }}
    >
      <Stack spacing={1}>
        <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ color: accent }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}
