import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import AddExpense from "./Pages/AddExpense";
import RegisterUser from "./Pages/RegisterUser";
import { useEffect, useState } from "react";
import { Alert } from "@mui/material";

export interface ToastProps {
  toastMessage: string;
  severity?: "success" | "error" | "warning" | "info";
}

function App() {
  // const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastProps | null>(null);
  useEffect(() => {
    setTimeout(() => {
      setToastMessage(null);
    }, 800);
  }, [toastMessage]);
  return (
    <>
      {toastMessage && (
        <Alert severity={toastMessage.severity}>
          {toastMessage.toastMessage}
        </Alert>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route
            path="/register"
            element={<RegisterUser setToastMessage={setToastMessage} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
