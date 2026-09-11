"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type { MarketNews } from "@/src/types/api";

export type NewsFeedKey = "latest" | "live" | "related";

export const newsFeeds: Array<{
  key: NewsFeedKey;
  title: string;
  description: string;
  endpoint: string;
}> = [
  {
    key: "latest",
    title: "Market News",
    description: "Latest market stories and company updates.",
    endpoint: "/market-news",
  },
  {
    key: "live",
    title: "Live Market Updates",
    description: "Fresh headlines from the active trading session.",
    endpoint: "/market-news/live",
  },
  {
    key: "related",
    title: "Related Stories",
    description: "More coverage connected to current market themes.",
    endpoint: "/market-news/related",
  },
];

type NewsState = Record<NewsFeedKey, MarketNews[]>;

const emptyNewsState: NewsState = { latest: [], live: [], related: [] };

export function useMarketNews() {
  const [feeds, setFeeds] = useState<NewsState>(emptyNewsState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const responses = await Promise.all(
        newsFeeds.map((feed) =>
          apiRequest<MarketNews[]>(feed.endpoint),
        ),
      );
      setFeeds({
        latest: responses[0].data ?? [],
        live: responses[1].data ?? [],
        related: responses[2].data ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load market news");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { feeds, loading, error, refresh };
}
