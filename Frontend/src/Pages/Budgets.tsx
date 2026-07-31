import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { ToastProps } from "../Components/Toast";
import type { ExpenseCategory } from "../types";
import { useExpenses } from "../context/ExpenseContext";
import { useBudgets } from "../context/BudgetContext";
import { useCurrency } from "../hooks/useCurrency";
import { formatCurrency } from "../utils/currency";
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from "../constants/categories";
import { ApiError } from "../api/client";
import "../Styles/Budgets.css";

interface BudgetsProps {
  setToastMessage: (message: ToastProps) => void;
}

const isThisMonth = (isoDate: string, reference: Date) => {
  const d = new Date(isoDate);
  return (
    d.getMonth() === reference.getMonth() &&
    d.getFullYear() === reference.getFullYear()
  );
};

const Budgets = ({ setToastMessage }: BudgetsProps) => {
  const { expenses } = useExpenses();
  const { budgets, isLoading, saveBudget, removeBudget } = useBudgets();
  const currency = useCurrency();

  const [category, setCategory] = useState<ExpenseCategory>(
    EXPENSE_CATEGORIES[0],
  );
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const now = useMemo(() => new Date(), []);

  // Spend per category for the current month — budgets are monthly caps.
  const spentByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    expenses
      .filter((expense) => isThisMonth(expense.date, now))
      .forEach((expense) => {
        totals.set(
          expense.category,
          (totals.get(expense.category) ?? 0) + expense.amount,
        );
      });
    return totals;
  }, [expenses, now]);

  const rows = useMemo(
    () =>
      budgets
        .map((budget) => {
          const spent = spentByCategory.get(budget.category) ?? 0;
          const percent =
            budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          return {
            ...budget,
            spent,
            remaining: budget.amount - spent,
            percent,
            state:
              percent >= 100 ? "over" : percent >= 80 ? "warn" : "ok",
          };
        })
        .sort((a, b) => b.percent - a.percent),
    [budgets, spentByCategory],
  );

  const totals = useMemo(() => {
    const limit = rows.reduce((sum, row) => sum + row.amount, 0);
    const spent = rows.reduce((sum, row) => sum + row.spent, 0);
    return { limit, spent, percent: limit > 0 ? (spent / limit) * 100 : 0 };
  }, [rows]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount < 0) {
      setToastMessage({
        message: "Enter a valid budget amount",
        severity: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveBudget(category, numericAmount);
      setToastMessage({
        message: `Budget set for ${category}`,
        severity: "success",
      });
      setAmount("");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to save budget.";
      setToastMessage({ message, severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string, categoryName: string) => {
    if (!window.confirm(`Remove the ${categoryName} budget?`)) return;
    try {
      await removeBudget(id);
      setToastMessage({ message: "Budget removed", severity: "success" });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to remove budget.";
      setToastMessage({ message, severity: "error" });
    }
  };

  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">{monthLabel}</span>
          <h2>Budgets</h2>
          <span className="page-subtitle">
            Set a monthly cap per category and track how close you are.
          </span>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="budget-total-card">
          <div className="budget-total-meta">
            <span className="budget-total-label">Spent across all budgets</span>
            <span className="budget-total-value">
              {formatCurrency(totals.spent, currency)}
              <span className="budget-total-limit">
                {" "}
                of {formatCurrency(totals.limit, currency)}
              </span>
            </span>
          </div>
          <div className="budget-track budget-track-lg">
            <div
              className={`budget-fill ${
                totals.percent >= 100
                  ? "fill-over"
                  : totals.percent >= 80
                    ? "fill-warn"
                    : "fill-ok"
              }`}
              style={{ width: `${Math.min(totals.percent, 100)}%` }}
            />
          </div>
        </div>
      )}

      <form className="budget-form" onSubmit={handleSave}>
        <div className="budget-form-field">
          <label htmlFor="budget-category">Category</label>
          <select
            id="budget-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ExpenseCategory)
            }
          >
            {EXPENSE_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="budget-form-field">
          <label htmlFor="budget-amount">Monthly limit</label>
          <input
            id="budget-amount"
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
        </div>

        <button type="submit" className="budget-save-btn" disabled={isSaving}>
          <FontAwesomeIcon icon={faCheck} />
          {isSaving ? "Saving..." : "Set budget"}
        </button>
      </form>

      {isLoading ? (
        <div className="budget-empty">Loading budgets...</div>
      ) : rows.length === 0 ? (
        <div className="budget-empty">
          <p>No budgets set yet.</p>
          <span>
            Pick a category above and set a monthly limit to start tracking.
          </span>
        </div>
      ) : (
        <div className="budget-grid">
          {rows.map((row) => (
            <article key={row._id} className="budget-card">
              <div className="budget-card-head">
                <span className="budget-category">
                  <span
                    className="category-dot"
                    style={{ backgroundColor: CATEGORY_COLORS[row.category] }}
                  />
                  {row.category}
                </span>
                <button
                  type="button"
                  className="budget-remove"
                  aria-label={`Remove ${row.category} budget`}
                  onClick={() => handleRemove(row._id, row.category)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              <div className="budget-amounts">
                <span className="budget-spent">
                  {formatCurrency(row.spent, currency)}
                </span>
                <span className="budget-limit">
                  of {formatCurrency(row.amount, currency)}
                </span>
              </div>

              <div className="budget-track">
                <div
                  className={`budget-fill fill-${row.state === "over" ? "over" : row.state === "warn" ? "warn" : "ok"}`}
                  style={{ width: `${Math.min(row.percent, 100)}%` }}
                />
              </div>

              <div className="budget-footer">
                <span className={`budget-percent state-${row.state}`}>
                  {Math.round(row.percent)}% used
                </span>
                <span className="budget-remaining">
                  {row.remaining >= 0
                    ? `${formatCurrency(row.remaining, currency)} left`
                    : `${formatCurrency(Math.abs(row.remaining), currency)} over`}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default Budgets;
