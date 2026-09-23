"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import type { MarketNews } from "@/src/types/api";

export type NewsFeedKey = "indian" | "global";

export const newsFeeds: Array<{
  key: NewsFeedKey;
  title: string;
  description: string;
  endpoint: string;
}> = [
  {
    key: "indian",
    title: "Indian News",
    description: "Latest news from Indian markets and companies.",
    endpoint: "/market-news",
  },
  {
    key: "global",
    title: "Global News",
    description: "Market headlines and trading updates from around the world.",
    endpoint: "/market-news/global",
  },
];

type NewsState = Record<NewsFeedKey, MarketNews[]>;

const emptyNewsState: NewsState = { indian: [], global: [] };
type NewsErrors = Partial<Record<NewsFeedKey, string>>;

export function useMarketNews() {
  const [feeds, setFeeds] = useState<NewsState>(emptyNewsState);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<NewsErrors>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const responses = await Promise.allSettled(
      newsFeeds.map(async (feed) => {
        const response = await apiRequest<MarketNews[]>(feed.endpoint, { skipAuth: true });
        if (!Array.isArray(response.data)) {
          throw new Error("The news server returned an invalid article list.");
        }
        return response.data;
      }),
    );
    const nextFeeds: NewsState = { ...emptyNewsState };
    const nextErrors: NewsErrors = {};

    responses.forEach((response, index) => {
      const { key } = newsFeeds[index];
      if (response.status === "fulfilled") {
        nextFeeds[key] = response.value;
      } else {
        nextErrors[key] = response.reason instanceof Error
          ? response.reason.message
          : "Unable to load market news";
      }
    });

    setFeeds(nextFeeds);
    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { feeds, loading, errors, refresh };
}
