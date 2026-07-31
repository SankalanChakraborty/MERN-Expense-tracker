import type { ExpenseCategory } from "../types";

/**
 * Must stay in sync with `ExpenseType` in Backend/enum.js — the API rejects
 * any category outside that enum.
 */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Groceries",
  "Transport",
  "Utility Bill",
  "Entertainment",
  "Health",
  "Rent",
  "Lending",
  "Other",
];

/** Category identity colour, shared by the table dots and the charts. */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#f59e0b",
  Groceries: "#3b82f6",
  Transport: "#ef4444",
  Entertainment: "#10b981",
  "Utility Bill": "#8b5cf6",
  Health: "#ec4899",
  Rent: "#22d3ee",
  Lending: "#a3e635",
  Other: "#94a3b8",
};
