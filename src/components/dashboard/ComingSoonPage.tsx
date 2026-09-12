import { Container, Paper, Stack, Typography } from "@mui/material";

export function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Container maxWidth="md" sx={{ pt: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          minHeight: 280,
          border: "1px solid rgba(25, 118, 210, 0.08)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h3">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
          <Typography color="primary.main" sx={{ fontWeight: 800 }}>
            Coming soon
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
