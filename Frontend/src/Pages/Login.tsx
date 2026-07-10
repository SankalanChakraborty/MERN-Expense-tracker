import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { User } from "../App";

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
    <div>
      <div>
        <h1>Expense Tracker</h1>
        <p>Track your monthly expenses</p>
      </div>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Sign in</button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};
export default Login;
