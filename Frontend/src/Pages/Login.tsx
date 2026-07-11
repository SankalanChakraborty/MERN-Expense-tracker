import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill1,
  faBolt,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import type { User } from "../App";
import "../Styles/Login.css";
import Input from "../Components/Input";
import Button from "../Components/Button";
import Chart from "../Components/SampleChart";

interface LoginProps {
  setToastMessage: (message: any) => void;
  setLoggedinUser: (user: User | null) => void;
}

const Login = ({ setToastMessage, setLoggedinUser }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        setToastMessage({ toastMessage: data.message, severity: "success" });
      }
      setLoggedinUser(data.user);
      navigateToDashboard();
    } catch (error) {
      console.error("Error during login:", error);
      setToastMessage({
        toastMessage: "An error occurred during login.",
        severity: "error",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="web-info">
        <div className="pill-info">
          <FontAwesomeIcon icon={faMoneyBill1} />
          Smart expense tracking for professionals
        </div>
        <h1>
          Your finances, <span className="highlight">beautifully</span> tracked.
        </h1>
        <p className="sub-info">
          Stop guessing where your money goes. Expensely gives you crystal-clear
          visibility into every rupee, every day.
        </p>
        <div className="more-info">
          <FontAwesomeIcon icon={faBolt} />
          <span>Instant expense logging</span>
        </div>
        <div className="sample-chart-data-adv">
          <span style={{ color: "#64748b", width: "100%" }}>
            Spending this month
          </span>
          <div className="chart-data">
            <Chart />
            <div className="chart-legend">
              <div className="chart-legend-item">
                <span
                  className="chart-color"
                  style={{ backgroundColor: "#F59E0B" }}
                ></span>
                <span className="chart-label">Groceries</span>
                <span className="chart-value">28%</span>
              </div>
              <div className="chart-legend-item">
                <span
                  className="chart-color"
                  style={{ backgroundColor: "#3B82F6" }}
                ></span>
                <span className="chart-label">Transport</span>
                <span className="chart-value">16%</span>
              </div>
              <div className="chart-legend-item">
                <span
                  className="chart-color"
                  style={{ backgroundColor: "#EF4444" }}
                ></span>
                <span className="chart-label">Dining</span>
                <span className="chart-value">22%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="expense-legends">
          <div>
            <span className="sample-chart-color"></span>
            <span className="sample-chart-label">Groceries</span>
          </div>
          <div>
            <span className="sample-chart-color"></span>
            <span className="sample-chart-label">Transport</span>
          </div>
          <div>
            <span className="sample-chart-color"></span>
            <span className="sample-chart-label">Dining</span>
          </div>
          <div>
            <span className="sample-chart-color"></span>
            <span className="sample-chart-label">Bills</span>
          </div>
          <div>
            <span className="sample-chart-color"></span>
            <span className="sample-chart-label">Shopping</span>
          </div>
        </div>
      </div>
      <div className="login-form">
        <div className="welcome-header">
          <h3>Welcome back</h3>
          <span>Sign in to your Expensely account</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="email-input">
            <label htmlFor="email">Email address</label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="someone@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="password-input">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" className="auth-button" icon={faRightToBracket}>
            Sign in
          </Button>
        </form>
        <div className="create-new-account">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
