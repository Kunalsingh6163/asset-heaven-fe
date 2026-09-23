"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { GoogleSignIn } from "@/src/components/auth/GoogleSignIn";
import { useAuth } from "@/src/hooks/useAuth";

const APP_LOGO_SRC = "/icons/AssetHeaven%20Logo.svg";

export function SignupForm() {
  const { signup, googleLogin, loading, error } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const updateField =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <AuthShell
      title="Create account"
      subtitle="Create your account and verify your email to get started."
    >
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
          void signup({
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            password: form.password,
          });
        }}
      >
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          required
          autoComplete="name"
          label="Full name"
          value={form.name}
          onChange={updateField("name")}
        />
        <TextField
          required
          autoComplete="email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={updateField("email")}
        />
        <TextField
          autoComplete="tel"
          label="Phone number"
          value={form.phone}
          onChange={updateField("phone")}
        />
        <TextField
          required
          autoComplete="new-password"
          label="Password"
          type="password"
          value={form.password}
          onChange={updateField("password")}
          slotProps={{ htmlInput: { minLength: 8 } }}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={<AssetIcon src={APP_LOGO_SRC} size={22} />}
        >
          {loading ? "Creating..." : "Signup"}
        </Button>
        <GoogleSignIn onCredential={(token) => { void googleLogin(token); }} disabled={loading} />
        <Divider />
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          Already verified?{" "}
          <Typography
            component={Link}
            href="/login"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            Login instead
          </Typography>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
