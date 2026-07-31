import type { CurrencyCode } from "../types";

export const CURRENCIES: {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
}[] = [
  { code: "INR", label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "USD", label: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", label: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ", locale: "ar-AE" },
];

const byCode = new Map(CURRENCIES.map((currency) => [currency.code, currency]));

export const getCurrency = (code: CurrencyCode) =>
  byCode.get(code) ?? byCode.get("INR")!;

/** Full formatted amount, e.g. "₹1,24,500". Decimals are dropped — this app tracks whole units. */
export const formatCurrency = (amount: number, code: CurrencyCode) => {
  const { locale, symbol } = getCurrency(code);
  return `${symbol}${Math.round(amount).toLocaleString(locale)}`;
};

/** Compact form for tight spots like chart axes, e.g. "₹12.4K". */
export const formatCompact = (amount: number, code: CurrencyCode) => {
  const { symbol } = getCurrency(code);
  const abs = Math.abs(amount);
  if (abs >= 10_000_000) return `${symbol}${(amount / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `${symbol}${(amount / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${Math.round(amount)}`;
};
