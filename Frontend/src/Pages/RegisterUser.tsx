import { useState, type FormEvent } from "react";
import type { ToastProps } from "../Components/Toast";
import { useNavigate, Link } from "react-router-dom";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "../Styles/Login.css";
import Input from "../Components/Input";
import Button from "../Components/Button";
import WebInfo from "../Components/WebInfo";
import { register } from "../api/auth";
import { ApiError } from "../api/client";

interface RegisterUserProps {
  setToastMessage: (message: ToastProps) => void;
}

const RegisterUser = ({ setToastMessage }: RegisterUserProps) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const clearForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data = await register(userName, email, password, confirmPassword);
      setToastMessage({ message: data.message, severity: "success" });
      clearForm();
      // Straight to the code screen — the account isn't usable until verified.
      navigate("/verify-email", { state: { email: data.email ?? email } });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "An error occurred during registration.";
      setToastMessage({ message, severity: "error" });
    }
  };

  return (
    <div className="login-container">
      <WebInfo />

      <div className="login-form">
        <div className="welcome-header">
          <h3>Create account</h3>
          <span>Start tracking your expenses today</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="email-input">
            <label htmlFor="userName">Username</label>
            <Input
              id="userName"
              name="userName"
              type="text"
              placeholder="John Doe"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </div>

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

          <div className="password-input">
            <label htmlFor="confirmPassword">Confirm password</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <Button type="submit" className="auth-button" icon={faUserPlus}>
            Create account
          </Button>
        </form>

        <div className="create-new-account">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
