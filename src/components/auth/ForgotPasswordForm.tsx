"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { usePasswordRecovery } from "@/src/hooks/usePasswordRecovery";

export function ForgotPasswordForm() {
  const { requestOtp, loading, error } = usePasswordRecovery();
  const [email, setEmail] = useState("");

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we will send a verification OTP."
    >
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
          void requestOtp({ email });
        }}
      >
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          required
          autoComplete="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={<AssetIcon src="/icons/change%20password.png" size={22} />}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          Remembered it?{" "}
          <Typography component={Link} href="/login" color="primary" sx={{ fontWeight: 800 }}>
            Back to login
          </Typography>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
