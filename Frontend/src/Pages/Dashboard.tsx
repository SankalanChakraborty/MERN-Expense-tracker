import React from "react";
import type { User } from "../App";

interface DashboardProps {
  loggedinUser: User | null;
}

const Dashboard = ({ loggedinUser }: DashboardProps) => {
  const navigateToLogin = () => {
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        navigateToLogin();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      <span>Welcome, {loggedinUser?.userName}!</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
