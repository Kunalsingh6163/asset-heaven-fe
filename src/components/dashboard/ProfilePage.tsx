"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import { apiRequest } from "@/src/lib/apiClient";
import { useAuthStore } from "@/src/store/authStore";
import type { ApiEnvelope, User } from "@/src/types/api";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
};

const toProfileForm = (user: User | null): ProfileForm => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  profilePicture: user?.profilePicture ?? "",
});

const isUser = (value: unknown): value is User =>
  Boolean(value && typeof value === "object" && "email" in value);

const extractUser = (response: ApiEnvelope<unknown>, fallback: User): User => {
  const data = response.data;

  if (isUser(data)) {
    return data;
  }

  if (data && typeof data === "object" && "user" in data) {
    const maybeUser = (data as { user?: unknown }).user;

    if (isUser(maybeUser)) {
      return maybeUser;
    }
  }

  return fallback;
};

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(user);
  const [form, setForm] = useState<ProfileForm>(() => toProfileForm(user));
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentProfile = profile ?? user;
  const identity = currentProfile?._id ?? currentProfile?.userId;
  const savedUserId = user?._id ?? user?.userId;
  const initials = (currentProfile?.name || currentProfile?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayRows = useMemo(
    () => [
      ["Email", currentProfile?.email ?? "Email not added"],
      ["Phone", currentProfile?.phone ?? "Phone number not added"],
      ["User ID", identity ?? "User identity not available"],
      [
        "Verified",
        currentProfile?.isEmailVerified == null
          ? "Not available"
          : currentProfile.isEmailVerified
            ? "Yes"
            : "No",
      ],
    ],
    [currentProfile, identity],
  );

  useEffect(() => {
    if (!savedUserId) {
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setError(null);

      try {
        const response = await apiRequest<unknown>(
          `/users/${encodeURIComponent(savedUserId)}`,
        );
        const freshUser = extractUser(response, { email: "" });

        if (!mounted) {
          return;
        }

        setProfile(freshUser);
        setUser(freshUser);

        if (!editing) {
          setForm(toProfileForm(freshUser));
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load latest profile details",
        );
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [editing, savedUserId, setUser]);

  const updateField =
    (field: keyof ProfileForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const startEditing = () => {
    setMessage(null);
    setError(null);
    setForm(toProfileForm(currentProfile));
    setEditing(true);
  };

  const cancelEditing = () => {
    setMessage(null);
    setError(null);
    setForm(toProfileForm(currentProfile));
    setEditing(false);
  };

  const saveProfile = async () => {
    const name = form.name.trim();

    if (name.length < 2) {
      setError("Enter a name with at least 2 characters");
      return;
    }

    if (!identity) {
      setError("User identity is not available for update");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    const nextUser: User = {
      ...(currentProfile ?? { email: form.email }),
      name,
      phone: form.phone.trim() || undefined,
      profilePicture: form.profilePicture.trim() || undefined,
    };

    try {
      const response = await apiRequest<unknown>(
        `/users/${encodeURIComponent(identity)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: nextUser.name,
            phone: form.phone.trim(),
            profilePicture: form.profilePicture.trim(),
          }),
        },
      );
      const updatedUser = extractUser(response, nextUser);

      setProfile(updatedUser);
      setUser(updatedUser);
      setForm(toProfileForm(updatedUser));
      setEditing(false);
      setMessage(response.message ?? "Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 4 }, border: "1px solid rgba(25, 118, 210, 0.08)" }}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{ alignItems: { xs: "center", sm: "flex-start" } }}
          >
            <Avatar
              src={form.profilePicture || profile?.profilePicture}
              sx={{ width: 92, height: 92, bgcolor: "secondary.main", fontSize: 34 }}
            >
              {currentProfile?.profilePicture ? (
                initials
              ) : (
                <AssetIcon src="/icons/user%20account.png" size={58} />
              )}
            </Avatar>
            <Stack spacing={1} sx={{ flex: 1, width: "100%" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4">{currentProfile?.name ?? "Profile"}</Typography>
                  <Typography color="text.secondary">
                    Manage your personal account details.
                  </Typography>
                </Box>
                {editing ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => void saveProfile()}
                      disabled={saving}
                      startIcon={
                        saving ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : undefined
                      }
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </Stack>
                ) : (
                  <Button variant="contained" onClick={startEditing}>
                    Edit
                  </Button>
                )}
              </Stack>

              {loadingProfile ? (
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  Loading latest profile...
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          {message ? <Alert severity="success">{message}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {editing ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              <TextField
                label="Full name"
                value={form.name}
                onChange={updateField("name")}
              />
              <TextField
                label="Email address"
                type="email"
                value={form.email}
                slotProps={{ input: { readOnly: true } }}
                helperText="Email address cannot be changed from your profile."
              />
              <TextField
                label="Phone number"
                value={form.phone}
                onChange={updateField("phone")}
              />
              <TextField
                label="Profile picture URL"
                value={form.profilePicture}
                onChange={updateField("profilePicture")}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              {displayRows.map(([label, value]) => (
                <Paper
                  key={label}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid rgba(25, 118, 210, 0.08)",
                    bgcolor: "rgba(25, 118, 210, 0.03)",
                  }}
                >
                  <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 800 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, overflowWrap: "anywhere" }}>
                    {value}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}

          <Stack spacing={0.75}>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              Profile updates use the current user identity and are sent only when Save is clicked.
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
