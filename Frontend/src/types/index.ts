export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "SGD"
  | "AED";

export interface User {
  readonly id: string;
  userName: string;
  email: string;
  currency: CurrencyCode;
}

export type ExpenseCategory =
  | "Food"
  | "Groceries"
  | "Transport"
  | "Entertainment"
  | "Utility Bill"
  | "Health"
  | "Rent"
  | "Lending"
  | "Other";

export interface Expense {
  _id: string;
  user: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  recurring: boolean;
}

export interface Budget {
  _id: string;
  user: string;
  category: ExpenseCategory;
  amount: number;
  createdAt: string;
  updatedAt: string;
}
