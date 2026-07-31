import { apiRequest } from "./client";
import type { Expense, ExpenseInput } from "../types";

interface ExpenseListResponse {
  status: string;
  message: string;
  expenses: Expense[];
}

interface ExpenseResponse {
  status: string;
  message: string;
  expense: Expense;
}

export const getExpenses = () => apiRequest<ExpenseListResponse>("/expense/expenses");

export const createExpense = (input: ExpenseInput) =>
  apiRequest<ExpenseResponse>("/expense/add", { method: "POST", body: input });

export const updateExpense = (id: string, input: ExpenseInput) =>
  apiRequest<ExpenseResponse>(`/expense/${id}`, { method: "PATCH", body: input });

export const deleteExpense = (id: string) =>
  apiRequest<{ status: string; message: string; id: string }>(`/expense/${id}`, {
    method: "DELETE",
  });
