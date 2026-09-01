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
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { useAuth } from "@/src/hooks/useAuth";

export function SignupForm() {
  const { signup, loading, error } = useAuth();
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
      subtitle="Signup sends an email OTP using the backend verification flow."
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
          endIcon={<PersonAddAltRoundedIcon />}
        >
          {loading ? "Creating..." : "Signup"}
        </Button>
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
