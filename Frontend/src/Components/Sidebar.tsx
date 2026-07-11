import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faGears,
  faHouse,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import { useState } from "react";

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>("dashboard");

  const handleMenuItemClick = (menu: string) => {
    setActiveMenu(menu);
  };

  return (
    <div className="dashboard-menu">
      <div className="header">
        <h3>
          <span className="highlight">Ex</span>pensely
        </h3>
      </div>
      <div className="menu-container">
        <div
          className={`menu-item ${activeMenu === "dashboard" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("dashboard")}
        >
          <FontAwesomeIcon icon={faHouse} />
          <span>Dashboard</span>
        </div>
        <div
          className={`menu-item ${activeMenu === "expenses" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("expenses")}
        >
          <FontAwesomeIcon icon={faListUl} />
          <span>Expenses</span>
        </div>
        <div
          className={`menu-item ${activeMenu === "budget" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("budget")}
        >
          <FontAwesomeIcon icon={faChartPie} />
          <span>Budgets</span>
        </div>
        <div
          className={`menu-item ${activeMenu === "settings" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("settings")}
        >
          <FontAwesomeIcon icon={faGears} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
