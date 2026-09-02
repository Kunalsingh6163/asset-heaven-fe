"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { usePasswordRecovery } from "@/src/hooks/usePasswordRecovery";

function VerifyPasswordOtpInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { verifyOtp, loading, error } = usePasswordRecovery();
  const [otp, setOtp] = useState("");

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the OTP sent to your email before choosing a new password."
    >
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
          void verifyOtp({ email, otp });
        }}
      >
        {!email ? <Alert severity="warning">Enter your email to request a new OTP.</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField disabled label="Email address" type="email" value={email} />
        <TextField
          required
          autoFocus
          label="Verification OTP"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading || !email || otp.length !== 6}
          endIcon={<AssetIcon src="/icons/keyboard%20numbers%20(right%20_)%20.png" size={22} />}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          Need a new OTP?{" "}
          <Typography component={Link} href="/forgot-password" color="primary" sx={{ fontWeight: 800 }}>
            Request again
          </Typography>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

export function VerifyPasswordOtpForm() {
  return (
    <Suspense fallback={null}>
      <VerifyPasswordOtpInner />
    </Suspense>
  );
}
