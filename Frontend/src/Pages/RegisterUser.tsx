import { useState } from "react";
import type { ToastProps } from "../App";
import { useNavigate, Link } from "react-router-dom";

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    <div>
      <div>
        <h1>Create account</h1>
        <p>Start tracking your expenses today</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="userName">Username</label>
        <input
          id="userName"
          name="userName"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterUser;
