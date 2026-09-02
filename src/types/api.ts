export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  summary?: PortfolioSummary;
  pagination?: Pagination;
  details?: string[] | Record<string, string>;
  error?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type User = {
  _id?: string;
  userId?: string;
  name?: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  admin?: boolean;
  createdAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
  tokenType?: "Bearer" | string;
};

export type AuthPayload = AuthTokens & {
  user: User;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type VerifyPasswordOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = {
  email: string;
  newPassword: string;
};

export type MarketQuote = {
  id?: string;
  symbol?: string;
  name?: string;
  shortName?: string;
  regularMarketPrice?: number;
  price?: number;
  currentPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  icon?: string;
  logo?: string;
  exchange?: string;
  sector?: string;
  [key: string]: unknown;
};

export type MarketHome = {
  data?: MarketHome;
  marketIndices?: MarketQuote[];
  trendingStocks?: MarketQuote[];
  mostActive?: MarketQuote[];
  topGainers?: MarketQuote[];
  topLosers?: MarketQuote[];
  nifty100?: MarketQuote[];
  mutualFunds?: MarketQuote[];
  etfs?: MarketQuote[];
  ipo?: MarketQuote[];
  marketNews?: MarketNews[];
  watchlist?: MarketQuote[];
  [key: string]: unknown;
};

export type MarketNews = {
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: string | number;
  summary?: string;
  thumbnail?: string;
  [key: string]: unknown;
};

export type StockHolding = {
  _id?: string;
  symbol: string;
  name?: string;
  icon?: string;
  quantity: number;
  price: number;
  currentPrice?: number;
  totalValue?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  transactionType?: "buy" | "sell";
  transactionDate?: string;
  sector?: string;
  exchange?: string;
  watchlist?: boolean;
  lastUpdated?: string;
  [key: string]: unknown;
};

export type PortfolioSummary = {
  totalInvestment?: number;
  totalCurrentValue?: number;
  totalProfitLoss?: number;
  totalProfitLossPercentage?: number;
  totalStocks?: number;
  [key: string]: unknown;
};

export type PortfolioSummaryResponse = {
  overall?: PortfolioSummary;
  bySector?: Array<Record<string, unknown>>;
};

export type MutualFundHolding = {
  _id?: string;
  fundName: string;
  schemeCode?: string;
  icon?: string;
  units: number;
  quantity?: number;
  investedAmount: number;
  purchaseNav?: number;
  currentNav?: number;
  currentValue?: number | null;
  profitLoss?: number | null;
  profitLossPercentage?: number | null;
  transactionDate?: string;
  purchaseDate?: string;
  transactionType?: "buy" | "sell";
  fundHouse?: string;
  category?: string;
  notes?: string;
};

export type Expense = {
  _id?: string;
  amount: number;
  category: string;
  notes?: string;
  expenseDate?: string;
  createdAt?: string;
};

export type ExpenseSummary = {
  budget: number;
  totalExpenses: number;
  remainingAmount: number;
  spentPercent: number | null;
  expenseCount: number;
  categoryBreakdown: Array<{
    category: string;
    totalExpenses: number;
    count: number;
  }>;
};
