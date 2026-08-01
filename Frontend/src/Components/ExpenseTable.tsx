import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Expense } from "../types";
import { CATEGORY_COLORS } from "../constants/categories";
import { useCurrency } from "../hooks/useCurrency";
import { formatCurrency } from "../utils/currency";
import "./ExpenseTable.css";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onAddFirst: () => void;
  /** Overrides the first-run empty state, e.g. when filters exclude everything. */
  emptyMessage?: string;
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ExpenseTable = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onAddFirst,
  emptyMessage,
}: ExpenseTableProps) => {
  const currency = useCurrency();

  if (isLoading) {
    return (
      <div className="expense-table-card expense-table-status">
        Loading expenses...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="expense-table-card expense-table-empty">
        <p>{emptyMessage ?? "No expenses yet."}</p>
        {!emptyMessage && (
          <button
            type="button"
            className="add-first-expense-btn"
            onClick={onAddFirst}
          >
            Add your first expense
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="expense-table-card">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th>Recurring</th>
            <th>Amount</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td data-label="Date">{formatDate(expense.date)}</td>
              <td data-label="Category">
                <span className="category-cell">
                  <span
                    className="category-dot"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[expense.category] ?? "#94a3b8",
                    }}
                  />
                  {expense.category}
                </span>
              </td>
              <td data-label="Note">{expense.note || "—"}</td>
              <td data-label="Recurring">
                {expense.recurring ? (
                  <span className="recurring-badge">Recurring</span>
                ) : (
                  "—"
                )}
              </td>
              <td data-label="Amount" className="amount-cell">
                {formatCurrency(expense.amount, currency)}
              </td>
              <td data-label="Actions" className="actions-cell">
                <button
                  type="button"
                  className="row-action-btn"
                  aria-label="Edit expense"
                  onClick={() => onEdit(expense)}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button
                  type="button"
                  className="row-action-btn row-action-danger"
                  aria-label="Delete expense"
                  onClick={() => onDelete(expense)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
