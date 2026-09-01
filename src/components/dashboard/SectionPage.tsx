"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

type SectionCard = {
  title: string;
  description: string;
  action?: string;
};

export function SectionPage({
  title,
  subtitle,
  cards,
}: {
  title: string;
  subtitle: string;
  cards: SectionCard[];
}) {
  return (
    <Container maxWidth="xl" sx={{ pt: 4 }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid rgba(25, 118, 210, 0.08)",
            background:
              "linear-gradient(135deg, #ffffff 0%, #edf8ff 62%, #fff2ef 100%)",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 } }}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              {subtitle}
            </Typography>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {cards.map((card) => (
            <Paper
              key={card.title}
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid rgba(25, 118, 210, 0.08)",
                minHeight: 176,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={1}>
                <Typography variant="h6">{card.title}</Typography>
                <Typography color="text.secondary">{card.description}</Typography>
              </Stack>
              {card.action ? (
                <Button endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: "start" }}>
                  {card.action}
                </Button>
              ) : null}
            </Paper>
          ))}
        </Box>
      </Stack>
    </Container>
  );
}
