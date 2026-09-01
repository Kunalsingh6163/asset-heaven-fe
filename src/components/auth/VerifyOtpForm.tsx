"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { useAuth } from "@/src/hooks/useAuth";

function VerifyOtpInner() {
  const searchParams = useSearchParams();
  const { verifyOtp, loading, error } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");

  return (
    <AuthShell
      title="Verify email"
      subtitle="Enter the OTP sent by the signup endpoint to activate your account."
    >
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
          void verifyOtp({ email, otp });
        }}
      >
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          required
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          required
          label="OTP"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={<MarkEmailReadRoundedIcon />}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          Need a new OTP?{" "}
          <Typography
            component={Link}
            href="/signup"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            Signup again
          </Typography>
        </Typography>
      </Stack>
    </AuthShell>
  );
}

export function VerifyOtpForm() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpInner />
    </Suspense>
  );
}
