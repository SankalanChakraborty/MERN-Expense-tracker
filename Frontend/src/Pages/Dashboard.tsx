import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { User } from "../App";
import Button from "../Components/Button";
import OverviewCards from "../Components/OverviewCards";
import Sidebar from "../Components/Sidebar";
import "../Styles/Dashboard.css";
import { useState } from "react";
import AddExpense from "./AddExpense";

interface DashboardProps {
  loggedinUser: User | null;
}

const Dashboard = ({ loggedinUser }: DashboardProps) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
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

  const handleAddExpense = () => {
    setShowAddExpense(true);
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
            onClick={handleAddExpense}
          >
            Add Expense
          </Button>
        </div>
        <div className="expense-overview">
          {expenseOverview.map((overviewItem) => (
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

      {showAddExpense ? (
        <AddExpense setShowAddExpense={setShowAddExpense} />
      ) : (
        ""
      )}

      {/* <Button type={"button"} icon={faPlus} onClick={handleLogout}>
        Logout
      </Button> */}
    </div>
  );
};

export default Dashboard;
