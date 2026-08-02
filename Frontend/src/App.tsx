import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterUser from "./Pages/RegisterUser";
import Login from "./Pages/Login";
import VerifyEmail from "./Pages/VerifyEmail";
import Dashboard from "./Pages/Dashboard";
import Expenses from "./Pages/Expenses";
import Budgets from "./Pages/Budgets";
import Settings from "./Pages/Settings";
import { useEffect, useState } from "react";
import Toast from "./Components/Toast";
import type { ToastProps } from "./Components/Toast";
import { AuthProvider } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { BudgetProvider } from "./context/BudgetContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicOnlyRoute from "./Components/PublicOnlyRoute";
import AppLayout from "./Components/AppLayout";

function App() {
  const [toastMessage, setToastMessage] = useState<ToastProps | null>(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <AuthProvider>
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          severity={toastMessage.severity}
        />
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterUser setToastMessage={setToastMessage} />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login setToastMessage={setToastMessage} />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicOnlyRoute>
                <VerifyEmail setToastMessage={setToastMessage} />
              </PublicOnlyRoute>
            }
          />

          {/* Everything below shares the sidebar shell and the expense/budget caches. */}
          <Route
            element={
              <ProtectedRoute>
                <ExpenseProvider>
                  <BudgetProvider>
                    <AppLayout />
                  </BudgetProvider>
                </ExpenseProvider>
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={<Dashboard setToastMessage={setToastMessage} />}
            />
            <Route
              path="/expenses"
              element={<Expenses setToastMessage={setToastMessage} />}
            />
            <Route
              path="/budgets"
              element={<Budgets setToastMessage={setToastMessage} />}
            />
            <Route
              path="/settings"
              element={<Settings setToastMessage={setToastMessage} />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
