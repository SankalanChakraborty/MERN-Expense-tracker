import { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Link,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import type { ToastProps } from "../App";
import { useNavigate } from "react-router-dom";

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
    // TODO: handle registration logic
    // console.log({ userName, email, password, confirmPassword });
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Create account
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
              Start tracking your expenses today
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              id="userName"
              name="userName"
              label="Username"
              variant="outlined"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              fullWidth
            />
            <TextField
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <TextField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              variant="outlined"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{ py: 1.5, fontSize: "1rem", fontWeight: 600 }}
            >
              Register
            </Button>
          </Box>

          <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/login" underline="hover" color="primary">
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterUser;
