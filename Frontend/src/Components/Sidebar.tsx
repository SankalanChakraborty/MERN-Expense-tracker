import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faGears,
  faHouse,
  faListUl,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS: { to: string; label: string; icon: IconDefinition }[] = [
  { to: "/dashboard", label: "Dashboard", icon: faHouse },
  { to: "/expenses", label: "Expenses", icon: faListUl },
  { to: "/budgets", label: "Budgets", icon: faChartPie },
  { to: "/settings", label: "Settings", icon: faGears },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial = user?.userName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="dashboard-menu">
      <div className="header">
        <h3>
          <span className="highlight">Ex</span>pensely
        </h3>
      </div>

      <nav className="menu-container">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="menu-icon">
              <FontAwesomeIcon icon={item.icon} />
            </span>
            <span className="menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="menu-footer">
        <div className="user-card">
          <span className="user-avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="user-meta">
            <span className="user-name">{user?.userName}</span>
            <span className="user-email">{user?.email}</span>
          </span>
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span className="menu-label">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
