import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterUser from "./Pages/RegisterUser";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AddExpense from "./Pages/AddExpense";
import { useEffect, useState } from "react";
import Toast from "./Components/Toast";
import type { ToastProps } from "./Components/Toast";

export interface User {
  readonly id: string;
  userName: string;
  email: string;
}

function App() {
  const [toastMessage, setToastMessage] = useState<ToastProps | null>(null);
  const [loggedinUser, setLoggedinUser] = useState<User | null>(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          severity={toastMessage.severity}
        />
      )}
      <BrowserRouter>
        <Routes>
          <Route
            path="/register"
            element={<RegisterUser setToastMessage={setToastMessage} />}
          />
          <Route
            path="/login"
            element={
              <Login
                setToastMessage={setToastMessage}
                setLoggedinUser={setLoggedinUser}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                loggedinUser={loggedinUser}
                setToastMessage={setToastMessage}
              />
            }
          />
          <Route path="/add-expense" element={<AddExpense />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
