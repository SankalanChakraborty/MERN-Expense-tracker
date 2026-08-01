import { useState } from "react";
import type { Expense } from "../types";
import type { ToastProps } from "../Components/Toast";
import { useExpenses } from "../context/ExpenseContext";
import { useCurrency } from "./useCurrency";
import { formatCurrency } from "../utils/currency";
import { ApiError } from "../api/client";

/**
 * Delete-an-expense flow with its confirmation dialog. Shared by Dashboard
 * and Expenses, which otherwise duplicate this verbatim.
 *
 * Spread `dialogProps` onto a <ConfirmDialog /> and call `requestDelete(expense)`
 * from the table's delete action.
 */
export const useExpenseDelete = (
  setToastMessage: (message: ToastProps) => void,
) => {
  const { removeExpense } = useExpenses();
  const currency = useCurrency();
  const [target, setTarget] = useState<Expense | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const cancel = () => {
    if (!isBusy) setTarget(null);
  };

  const confirm = async () => {
    if (!target) return;

    setIsBusy(true);
    try {
      await removeExpense(target._id);
      setToastMessage({ message: "Expense deleted", severity: "success" });
      setTarget(null);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to delete expense.";
      setToastMessage({ message, severity: "error" });
    } finally {
      setIsBusy(false);
    }
  };

  const describe = (expense: Expense) => {
    const amount = formatCurrency(expense.amount, currency);
    const date = new Date(expense.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${amount} · ${expense.category} · ${date}. This can't be undone.`;
  };

  return {
    requestDelete: (expense: Expense) => setTarget(expense),
    dialogProps: {
      open: target !== null,
      title: "Delete this expense?",
      message: target ? describe(target) : "",
      confirmLabel: "Delete",
      tone: "danger" as const,
      isBusy,
      onConfirm: confirm,
      onCancel: cancel,
    },
  };
};
