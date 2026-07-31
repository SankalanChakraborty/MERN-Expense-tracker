import { useMemo, useState } from "react";
import { faPlus, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../Components/Button";
import ExpenseTable from "../Components/ExpenseTable";
import AddExpense from "./AddExpense";
import type { ToastProps } from "../Components/Toast";
import type { Expense, ExpenseCategory } from "../types";
import { useExpenses } from "../context/ExpenseContext";
import { useCurrency } from "../hooks/useCurrency";
import { formatCurrency } from "../utils/currency";
import { ApiError } from "../api/client";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import "../Styles/Expenses.css";

interface ExpensesProps {
  setToastMessage: (message: ToastProps) => void;
}

const ALL = "all";

/** "2026-07" -> "July 2026", for the month filter options. */
const monthKeyToLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const monthKeyOf = (isoDate: string) => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const Expenses = ({ setToastMessage }: ExpensesProps) => {
  const { expenses, isLoading, removeExpense } = useExpenses();
  const currency = useCurrency();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | typeof ALL>(ALL);
  const [month, setMonth] = useState<string>(ALL);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthOptions = useMemo(() => {
    const keys = new Set(expenses.map((expense) => monthKeyOf(expense.date)));
    return Array.from(keys).sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      if (category !== ALL && expense.category !== category) return false;
      if (month !== ALL && monthKeyOf(expense.date) !== month) return false;
      if (query) {
        const haystack =
          `${expense.note ?? ""} ${expense.category}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [expenses, search, category, month]);

  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);
  const hasFilters = search.trim() !== "" || category !== ALL || month !== ALL;

  const clearFilters = () => {
    setSearch("");
    setCategory(ALL);
    setMonth(ALL);
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowAddExpense(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await removeExpense(id);
      setToastMessage({ message: "Expense deleted", severity: "success" });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to delete expense.";
      setToastMessage({ message, severity: "error" });
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">History</span>
          <h2>Expenses</h2>
          <span className="page-subtitle">
            Search, filter and manage everything you've logged.
          </span>
        </div>

        <Button
          className={"add-expense"}
          type={"button"}
          icon={faPlus}
          onClick={handleAddExpense}
        >
          Add Expense
        </Button>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes or categories"
            aria-label="Search expenses"
          />
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ExpenseCategory | typeof ALL)
          }
          aria-label="Filter by category"
        >
          <option value={ALL}>All categories</option>
          {EXPENSE_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          aria-label="Filter by month"
        >
          <option value={ALL}>All time</option>
          {monthOptions.map((key) => (
            <option key={key} value={key}>
              {monthKeyToLabel(key)}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button type="button" className="clear-filters" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      <div className="filter-summary">
        <span>
          <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "expense" : "expenses"}
        </span>
        <span className="filter-summary-total">
          Total <strong>{formatCurrency(filteredTotal, currency)}</strong>
        </span>
      </div>

      <ExpenseTable
        expenses={filtered}
        isLoading={isLoading}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onAddFirst={handleAddExpense}
        emptyMessage={
          hasFilters ? "No expenses match these filters." : undefined
        }
      />

      {showAddExpense && (
        <AddExpense
          setShowAddExpense={setShowAddExpense}
          setToastMessage={setToastMessage}
          expenseToEdit={editingExpense}
        />
      )}
    </>
  );
};

export default Expenses;
