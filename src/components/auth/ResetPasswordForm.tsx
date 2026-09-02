"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { usePasswordRecovery } from "@/src/hooks/usePasswordRecovery";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { resetPassword, loading, error } = usePasswordRecovery();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Create a strong password for your verified account."
    >
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
          if (passwordsMatch) void resetPassword({ email, newPassword });
        }}
      >
        {!email ? <Alert severity="warning">Verify your email before resetting the password.</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField disabled label="Email address" type="email" value={email} />
        <TextField
          required
          autoFocus
          autoComplete="new-password"
          label="New password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          slotProps={{ htmlInput: { minLength: 8 } }}
          helperText="Use at least 8 characters."
        />
        <TextField
          required
          autoComplete="new-password"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={Boolean(confirmPassword) && !passwordsMatch}
          helperText={Boolean(confirmPassword) && !passwordsMatch ? "Passwords do not match." : " "}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading || !email || newPassword.length < 8 || !passwordsMatch}
          endIcon={<AssetIcon src="/icons/change%20password.png" size={22} />}
        >
          {loading ? "Updating password..." : "Update password"}
        </Button>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          <Typography component={Link} href="/login" color="primary" sx={{ fontWeight: 800 }}>
            Back to login
          </Typography>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
