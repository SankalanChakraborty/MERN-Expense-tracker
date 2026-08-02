import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import "../Styles/Login.css";
import Input from "../Components/Input";
import Button from "../Components/Button";
import WebInfo from "../Components/WebInfo";
import type { ToastProps } from "../Components/Toast";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

interface LoginProps {
  setToastMessage: (message: ToastProps) => void;
}

const Login = ({ setToastMessage }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(email, password);
      setToastMessage({ message: "Login successful", severity: "success" });
    } catch (error) {
      // Credentials were right but the address was never confirmed — take them
      // to the code screen instead of showing a dead end.
      if (
        error instanceof ApiError &&
        (error.payload as { code?: string })?.code === "EMAIL_NOT_VERIFIED"
      ) {
        setToastMessage({ message: error.message, severity: "info" });
        navigate("/verify-email", { state: { email } });
        return;
      }

      const message =
        error instanceof ApiError
          ? error.message
          : "Error while logging in. Please try again !";
      setToastMessage({ message, severity: "error" });
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
