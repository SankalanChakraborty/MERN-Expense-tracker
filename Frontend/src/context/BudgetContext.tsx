import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Budget, ExpenseCategory } from "../types";
import * as budgetsApi from "../api/budgets";
import { useAuth } from "./AuthContext";

interface BudgetContextValue {
  budgets: Budget[];
  isLoading: boolean;
  saveBudget: (category: ExpenseCategory, amount: number) => Promise<Budget>;
  removeBudget: (id: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  // Key off the id, not the user object — see the note in ExpenseContext.
  const userId = user?.id ?? null;
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  // Clear during render (not in an effect) when the session ends, so one
  // account's budgets are never briefly visible to the next.
  if (!userId && loadedForUserId !== null) {
    setLoadedForUserId(null);
    setBudgets([]);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flips the loading flag before the fetch it gates kicks off
    setIsLoading(true);
    budgetsApi
      .getBudgets()
      .then((data) => {
        if (cancelled) return;
        setBudgets(data.budgets);
        setLoadedForUserId(userId);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveBudget = async (category: ExpenseCategory, amount: number) => {
    const data = await budgetsApi.setBudget(category, amount);
    setBudgets((prev) => {
      const exists = prev.some((budget) => budget._id === data.budget._id);
      return exists
        ? prev.map((budget) =>
            budget._id === data.budget._id ? data.budget : budget,
          )
        : [...prev, data.budget];
    });
    return data.budget;
  };

  const removeBudget = async (id: string) => {
    await budgetsApi.deleteBudget(id);
    setBudgets((prev) => prev.filter((budget) => budget._id !== id));
  };

  return (
    <BudgetContext.Provider
      value={{ budgets, isLoading, saveBudget, removeBudget }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook is tightly coupled to this context
export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgets must be used within a BudgetProvider");
  }
  return context;
};
