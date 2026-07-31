import { useState } from "react";
import Input from "../Components/Input";
import "../Styles/AddExpense.css";
import type { ToastProps } from "../Components/Toast";
import type { Expense, ExpenseCategory } from "../types";
import { useExpenses } from "../context/ExpenseContext";
import { ApiError } from "../api/client";
import { EXPENSE_CATEGORIES as categories } from "../constants/categories";

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

interface AddExpenseProps {
  setShowAddExpense: (state: boolean) => void;
  setToastMessage: (message: ToastProps) => void;
  expenseToEdit?: Expense | null;
}

const AddExpense = ({
  setShowAddExpense,
  setToastMessage,
  expenseToEdit,
}: AddExpenseProps) => {
  const { addExpense, editExpense } = useExpenses();
  const isEditMode = Boolean(expenseToEdit);

  const [amount, setAmount] = useState(
    expenseToEdit ? String(expenseToEdit.amount) : "",
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    expenseToEdit?.category ?? categories[0],
  );
  const [date, setDate] = useState(
    expenseToEdit ? expenseToEdit.date.slice(0, 10) : todayIsoDate(),
  );
  const [note, setNote] = useState(expenseToEdit?.note ?? "");
  const [recurring, setRecurring] = useState(expenseToEdit?.recurring ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const hideAddExpenseModal = () => {
    setShowAddExpense(false);
  };

  const handleSaveNewExpense = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = { amount: Number(amount), category, date, note, recurring };

      if (isEditMode && expenseToEdit) {
        await editExpense(expenseToEdit._id, payload);
        setToastMessage({ message: "Expense updated", severity: "success" });
      } else {
        await addExpense(payload);
        setToastMessage({ message: "New expense added", severity: "success" });
      }

      setShowAddExpense(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to save expense. Please try again later!";
      setToastMessage({ message, severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-expense-page">
      <div
        className="add-expense-modal-overlay"
        role="dialog"
        aria-modal="true"
      >
        <div className="add-expense-modal">
          <div className="add-expense-modal-header">
            <div>
              <p className="add-expense-eyebrow">
                {isEditMode ? "Edit entry" : "New entry"}
              </p>
              <h2>{isEditMode ? "Edit expense" : "Add expense"}</h2>
            </div>
            <button
              type="button"
              className="close-button"
              onClick={hideAddExpenseModal}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form className="add-expense-form" onSubmit={handleSaveNewExpense}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as ExpenseCategory)
                  }
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="note">Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Optional note"
                />
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
              />
              Recurring monthly
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={hideAddExpenseModal}
              >
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : isEditMode
                    ? "Save changes"
                    : "Save expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
