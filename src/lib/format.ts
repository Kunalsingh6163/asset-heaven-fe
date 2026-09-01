export const formatCurrency = (value?: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

export const formatNumber = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

export const formatPercent = (value?: number) =>
  `${Number(value ?? 0).toFixed(2)}%`;

export const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
