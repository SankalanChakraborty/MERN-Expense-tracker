import { apiRequest } from "./client";
import type { Budget, ExpenseCategory } from "../types";

interface BudgetListResponse {
  status: string;
  message: string;
  budgets: Budget[];
}

interface BudgetResponse {
  status: string;
  message: string;
  budget: Budget;
}

export const getBudgets = () => apiRequest<BudgetListResponse>("/budget/budgets");

export const setBudget = (category: ExpenseCategory, amount: number) =>
  apiRequest<BudgetResponse>("/budget/set", {
    method: "PUT",
    body: { category, amount },
  });

export const deleteBudget = (id: string) =>
  apiRequest<{ status: string; message: string; id: string }>(`/budget/${id}`, {
    method: "DELETE",
  });
