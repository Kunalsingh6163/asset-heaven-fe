"use client";

import { Box, Snackbar } from "@mui/material";

type CustomSnackbarProps = {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
};

export function CustomSnackbar({
  open,
  message,
  severity,
  onClose,
}: CustomSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4200}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Box
        role="status"
        sx={{
          minWidth: 280,
          maxWidth: 420,
          borderRadius: 2,
          px: 2,
          py: 1.5,
          color: "#ffffff",
          fontWeight: 800,
          boxShadow: "0 18px 40px rgba(19, 34, 56, 0.18)",
          bgcolor: severity === "success" ? "#2e7d32" : "#d32f2f",
        }}
      >
        {message}
      </Box>
    </Snackbar>
  );
}
