import { useState, type FormEvent } from "react";
import type { ToastProps } from "../App";
import { useNavigate, Link } from "react-router-dom";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "../Styles/Login.css";
import Input from "../Components/Input";
import Button from "../Components/Button";
import WebInfo from "../Components/WebInfo";

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

  const navigateToLogin = () => {
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userName, email, password, confirmPassword }),
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        setToastMessage({ toastMessage: data.message, severity: "success" });
        navigateToLogin();
      } else {
        setToastMessage({ toastMessage: data.message, severity: "error" });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setToastMessage({
        toastMessage: "An error occurred during registration.",
        severity: "error",
      });
    }
    clearForm();
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
