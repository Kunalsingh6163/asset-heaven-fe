"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { AssetIcon } from "@/src/components/common/AssetIcon";
import {
  newsFeeds,
  type NewsFeedKey,
  useMarketNews,
} from "@/src/hooks/useMarketNews";
import type { MarketNews } from "@/src/types/api";

const thumbnailUrl = (article?: MarketNews) =>
  typeof article?.thumbnail === "string"
    ? article.thumbnail
    : article?.thumbnail?.url;

const articleTime = (article: MarketNews) => {
  const value = article.publishedAt ?? article.providerPublishTime;
  if (!value) return "Latest";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Latest"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
};

function StoryImage({ article, size = 92 }: { article: MarketNews; size?: number }) {
  const imageUrl = thumbnailUrl(article);

  if (!imageUrl) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.light",
          borderRadius: 2,
        }}
      >
        <AssetIcon src="/icons/repo%20rate%20rbi.png" size={Math.round(size * 0.5)} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt=""
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        objectFit: "cover",
        borderRadius: 2,
        bgcolor: "primary.light",
      }}
    />
  );
}

function ArticleLink({ article, compact = false }: { article: MarketNews; compact?: boolean }) {
  const content = (
    <Stack direction="row" spacing={compact ? 1.5 : 2} sx={{ alignItems: "flex-start" }}>
      <StoryImage article={article} size={compact ? 58 : 92} />
      <Stack spacing={0.6} sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontWeight: 800,
            lineHeight: 1.35,
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: compact ? 2 : 3,
          }}
        >
          {article.title ?? "Market update"}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          {article.publisher ?? "Market news"} · {articleTime(article)}
        </Typography>
        {article.relatedTickers?.length ? (
          <Typography color="primary.main" sx={{ fontSize: 12, fontWeight: 800 }}>
            {article.relatedTickers.slice(0, 3).join(" · ")}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );

  return article.link ? (
    <Box
      component="a"
      href={article.link}
      target="_blank"
      rel="noreferrer"
      sx={{ color: "inherit", textDecoration: "none", display: "block" }}
    >
      {content}
    </Box>
  ) : (
    content
  );
}

export function NewsPage() {
  const { feeds, loading, errors, refresh } = useMarketNews();
  const [selectedFeed, setSelectedFeed] = useState<NewsFeedKey | null>(null);
  const activeFeed = newsFeeds.find((feed) => feed.key === selectedFeed);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack spacing={0.75}>
          <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 40 } }}>
            Market News
          </Typography>
          <Typography color="text.secondary">
            Follow the latest Indian and global market news.
          </Typography>
        </Stack>

        {loading ? (
          <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {newsFeeds.map((feed) => {
              const leadArticle = feeds[feed.key][0];

              return (
                <Paper
                  key={feed.key}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    minHeight: 300,
                    border: "1px solid rgba(25, 118, 210, 0.12)",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack spacing={0.4} sx={{ mb: 2 }}>
                    <Typography variant="h6">{feed.title}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                      {feed.description}
                    </Typography>
                  </Stack>

                  <Box sx={{ flex: 1 }}>
                    {errors[feed.key] ? (
                      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refresh()}>Retry</Button>}>
                        {feed.title}: {errors[feed.key]}
                      </Alert>
                    ) : leadArticle ? (
                      <ArticleLink article={leadArticle} />
                    ) : (
                      <Typography color="text.secondary">No stories are available right now.</Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                    <Button
                      size="small"
                      disabled={!feeds[feed.key].length}
                      onClick={() => setSelectedFeed(feed.key)}
                      endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    >
                      View all
                    </Button>
                    {leadArticle?.link ? (
                      <Button
                        size="small"
                        component="a"
                        href={leadArticle.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read more
                      </Button>
                    ) : null}
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}
      </Stack>

      <Dialog
        open={Boolean(selectedFeed)}
        onClose={() => setSelectedFeed(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 7 }}>
          {activeFeed?.title ?? "Market News"}
          <IconButton
            aria-label="Close news list"
            onClick={() => setSelectedFeed(null)}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack divider={<Divider flexItem />} spacing={0}>
            {selectedFeed
              ? feeds[selectedFeed].map((article, index) => (
                  <Box key={article.uuid ?? `${article.title}-${index}`} sx={{ py: 2 }}>
                    <ArticleLink article={article} compact />
                  </Box>
                ))
              : null}
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
