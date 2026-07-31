import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Expense, ExpenseInput } from "../types";
import * as expensesApi from "../api/expenses";
import { useAuth } from "./AuthContext";

interface ExpenseContextValue {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (input: ExpenseInput) => Promise<Expense>;
  editExpense: (id: string, input: ExpenseInput) => Promise<Expense>;
  removeExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  // Reset state during render (not in an effect) when the signed-in user
  // changes, so no stale expense list is briefly visible across accounts.
  if (!user && loadedForUserId !== null) {
    setLoadedForUserId(null);
    setExpenses([]);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flips the loading flag before the fetch it gates kicks off
    setIsLoading(true);
    expensesApi
      .getExpenses()
      .then((data) => {
        if (cancelled) return;
        setExpenses(data.expenses);
        setLoadedForUserId(user.id);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addExpense = async (input: ExpenseInput) => {
    const data = await expensesApi.createExpense(input);
    setExpenses((prev) => [data.expense, ...prev]);
    return data.expense;
  };

  const editExpense = async (id: string, input: ExpenseInput) => {
    const data = await expensesApi.updateExpense(id, input);
    setExpenses((prev) => prev.map((expense) => (expense._id === id ? data.expense : expense)));
    return data.expense;
  };

  const removeExpense = async (id: string) => {
    await expensesApi.deleteExpense(id);
    setExpenses((prev) => prev.filter((expense) => expense._id !== id));
  };

  return (
    <ExpenseContext.Provider
      value={{ expenses, isLoading, addExpense, editExpense, removeExpense }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook is tightly coupled to this context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
