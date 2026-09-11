"use client";

import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { AssetIcon } from "@/src/components/common/AssetIcon";

const APP_LOGO_SRC = "/icons/AssetHeaven%20Logo.svg";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5fbff 0%, #eaf6ff 45%, #fff7f5 100%)",
        display: "flex",
        alignItems: "center",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <Stack spacing={3}>
            <Box
              sx={{
                width: 62,
                height: 62,
                borderRadius: "18px",
                bgcolor: "#ffffff",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 18px 35px rgba(25, 118, 210, 0.25)",
                overflow: "hidden",
              }}
            >
              <AssetIcon src={APP_LOGO_SRC} alt="Asset Heaven" size={54} />
            </Box>
            <Stack spacing={1.5}>
              <Typography variant="h2" sx={{ fontSize: { xs: 38, md: 54 } }}>
                Asset Heaven
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
                A calm, iOS-inspired command center for market movement,
                portfolio tracking, and authenticated trading workflows.
              </Typography>
            </Stack>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              border: "1px solid rgba(25, 118, 210, 0.08)",
              backdropFilter: "blur(14px)",
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={0.5}>
                <Typography variant="h4">{title}</Typography>
                <Typography color="text.secondary">{subtitle}</Typography>
              </Stack>
              {children}
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
