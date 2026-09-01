"use client";

import { Avatar, Container, Paper, Stack, Typography } from "@mui/material";
import { useAuthStore } from "@/src/store/authStore";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const initials = (user?.name || user?.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 4 }, border: "1px solid rgba(25, 118, 210, 0.08)" }}
      >
        <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
          <Avatar
            src={user?.profilePicture}
            sx={{ width: 92, height: 92, bgcolor: "secondary.main", fontSize: 34 }}
          >
            {initials}
          </Avatar>
          <Stack spacing={0.75}>
            <Typography variant="h4">{user?.name ?? "Profile"}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
            <Typography color="text.secondary">
              {user?.phone ?? "Phone number not added"}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
