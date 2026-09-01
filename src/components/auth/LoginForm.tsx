"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { AuthShell } from "@/src/components/auth/AuthShell";
import { useAuth } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/store/authStore";

export function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const { accessToken, hasHydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hasHydrated && accessToken) {
      router.replace("/dashboard");
    }
  }, [accessToken, hasHydrated, router]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your verified email to open your trading dashboard."
    >
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(event) => {
          event.preventDefault();
          void login({ email, password });
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
        <TextField
          required
          autoComplete="current-password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={<LoginRoundedIcon />}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>
        <Divider />
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          New to Asset Heaven?{" "}
          <Typography
            component={Link}
            href="/signup"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            Create an account
          </Typography>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
