import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { User } from "../App";
import Button from "../Components/Button";
import OverviewCards from "../Components/OverviewCards";
import Sidebar from "../Components/Sidebar";
import type { ToastProps } from "../Components/Toast";
import "../Styles/Dashboard.css";

interface DashboardProps {
  loggedinUser: User | null;
  setToastMessage: (message: ToastProps) => void;
}

const Dashboard = ({ loggedinUser, setToastMessage }: DashboardProps) => {
  const expenseOverview = [
    {
      cardHeading: "Total Spent",
      amount: 24300,
      status: "12% greater than last month",
    },
    {
      cardHeading: "Remaining",
      amount: 6700,
      status: "On track",
    },
    {
      cardHeading: "Transactions",
      numberOfTransactions: 38,
      status: "This month",
    },
    {
      cardHeading: "Savings Goal",
      savingsPerentage: 68,
      status: "₹8.2K saved",
    },
  ];

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
        setToastMessage({ message: data.message, severity: "success" });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-details-container">
        <div className="dashboard-header">
          <div className="welcome-message">
            <h3>Good Morning, {loggedinUser?.userName}</h3>
            <span>Here's your July 2025 overview</span>
          </div>

          <Button
            className={"add-expense"}
            type={"button"}
            icon={faPlus}
            onClick={handleLogout}
          >
            Add Expense
          </Button>
        </div>
        <div className="expense-overview">
          {expenseOverview.map((overviewItem, index) => (
            <OverviewCards
              key={overviewItem.cardHeading}
              cardHeading={overviewItem.cardHeading}
              status={overviewItem.status}
              amount={overviewItem.amount}
              numberOfTransactions={overviewItem.numberOfTransactions}
              savingsPerentage={overviewItem.savingsPerentage}
            />
          ))}
        </div>
      </div>

      <Button type={"button"} icon={faPlus} onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
