import {
  faPlus,
  faWallet,
  faReceipt,
  faTag,
  faDivide,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Components/Button";
import OverviewCards, { type StatTone } from "../Components/OverviewCards";
import "../Styles/Dashboard.css";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddExpense from "./AddExpense";
import ExpenseTable from "../Components/ExpenseTable";
import ConfirmDialog from "../Components/ConfirmDialog";

// recharts is ~400kB of the bundle and is only needed here, so it loads on
// demand rather than blocking first paint on Login/Expenses/Budgets/Settings.
const CategoryBreakdownChart = lazy(
  () => import("../Components/CategoryBreakdownChart"),
);
const SpendingTrendChart = lazy(
  () => import("../Components/SpendingTrendChart"),
);
import type { ToastProps } from "../Components/Toast";
import type { Expense } from "../types";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { useCurrency } from "../hooks/useCurrency";
import { useExpenseDelete } from "../hooks/useExpenseDelete";
import { formatCurrency } from "../utils/currency";

interface DashboardProps {
  setToastMessage: (message: ToastProps) => void;
}

const RECENT_LIMIT = 5;

const isSameMonth = (isoDate: string, reference: Date) => {
  const d = new Date(isoDate);
  return (
    d.getMonth() === reference.getMonth() &&
    d.getFullYear() === reference.getFullYear()
  );
};

const Dashboard = ({ setToastMessage }: DashboardProps) => {
  const { user } = useAuth();
  const currency = useCurrency();
  const { expenses, isLoading } = useExpenses();
  const { requestDelete, dialogProps } = useExpenseDelete(setToastMessage);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const now = useMemo(() => new Date(), []);
  const lastMonthRef = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() - 1, 1),
    [now],
  );

  const currentMonthExpenses = useMemo(
    () => expenses.filter((expense) => isSameMonth(expense.date, now)),
    [expenses, now],
  );
  const lastMonthExpenses = useMemo(
    () => expenses.filter((expense) => isSameMonth(expense.date, lastMonthRef)),
    [expenses, lastMonthRef],
  );

  const totalThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = currentMonthExpenses.length;
  const avgPerTransaction =
    transactionCount > 0 ? totalThisMonth / transactionCount : 0;

  const topCategory = useMemo(() => {
    const totals = new Map<string, number>();
    currentMonthExpenses.forEach((expense) => {
      totals.set(
        expense.category,
        (totals.get(expense.category) ?? 0) + expense.amount,
      );
    });
    let top: string | null = null;
    let topAmount = 0;
    totals.forEach((amount, category) => {
      if (amount > topAmount) {
        top = category;
        topAmount = amount;
      }
    });
    return top;
  }, [currentMonthExpenses]);

  const spent = useMemo<{ status: string; tone: StatTone }>(() => {
    if (totalLastMonth === 0) {
      return { status: "No spending last month", tone: "neutral" };
    }
    const percentChange = Math.round(
      ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100,
    );
    if (percentChange === 0) {
      return { status: "Same as last month", tone: "neutral" };
    }
    return {
      status: `${Math.abs(percentChange)}% vs last month`,
      tone: percentChange > 0 ? "up" : "down",
    };
  }, [totalThisMonth, totalLastMonth]);

  const recentExpenses = useMemo(
    () => expenses.slice(0, RECENT_LIMIT),
    [expenses],
  );

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowAddExpense(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  return (
    <>
      <div className="page-header">
        <div className="welcome-message">
          <span className="page-eyebrow">
            {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <h2>Good to see you, {user?.userName}</h2>
          <span className="page-subtitle">
            Here's where your money went this month.
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

      <div className="expense-overview">
        <OverviewCards
          cardHeading="Total Spent"
          value={formatCurrency(totalThisMonth, currency)}
          status={spent.status}
          tone={spent.tone}
          icon={faWallet}
        />
        <OverviewCards
          cardHeading="Transactions"
          value={String(transactionCount)}
          status="This month"
          icon={faReceipt}
        />
        <OverviewCards
          cardHeading="Top Category"
          value={topCategory ?? "—"}
          status="Most spent this month"
          icon={faTag}
        />
        <OverviewCards
          cardHeading="Avg / Transaction"
          value={formatCurrency(avgPerTransaction, currency)}
          status={`Across ${transactionCount} transactions`}
          icon={faDivide}
        />
      </div>

      <div className="dashboard-charts">
        <Suspense
          fallback={<div className="chart-card chart-empty">Loading chart…</div>}
        >
          <CategoryBreakdownChart expenses={currentMonthExpenses} />
          <SpendingTrendChart expenses={expenses} />
        </Suspense>
      </div>

      <section className="recent-activity">
        <div className="section-heading">
          <h3>Recent activity</h3>
          <Link to="/expenses" className="section-link">
            View all expenses
          </Link>
        </div>
        <ExpenseTable
          expenses={recentExpenses}
          isLoading={isLoading}
          onEdit={handleEditExpense}
          onDelete={requestDelete}
          onAddFirst={handleAddExpense}
        />
      </section>

      {showAddExpense && (
        <AddExpense
          setShowAddExpense={setShowAddExpense}
          setToastMessage={setToastMessage}
          expenseToEdit={editingExpense}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </>
  );
};

export default Dashboard;
