import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import type { User } from "../App";
import "../Styles/Login.css";
import Input from "../Components/Input";
import Button from "../Components/Button";
import WebInfo from "../Components/WebInfo";
import type { ToastProps } from "../Components/Toast";

interface LoginProps {
  setToastMessage: (message: ToastProps) => void;
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
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
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
        setToastMessage({ message: data.message, severity: "success" });
      }
      setLoggedinUser(data.user);
      navigateToDashboard();
    } catch (error) {
      console.error("Error during login:", error);
      setToastMessage({
        message: "An error occurred during login.",
        severity: "error",
      });
    }
  };

  return (
    <div className="login-container">
      <WebInfo />
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
