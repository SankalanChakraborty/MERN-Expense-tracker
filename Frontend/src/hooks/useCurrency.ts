import { useAuth } from "../context/AuthContext";
import type { CurrencyCode } from "../types";

/** The signed-in user's display currency, defaulting to INR before the profile loads. */
export const useCurrency = (): CurrencyCode =>
  useAuth().user?.currency ?? "INR";
