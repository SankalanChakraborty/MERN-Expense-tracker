import { Box, Typography, Container } from "@mui/material";
import Input from "../Components/Input";
import Button from "../Components/Button";

const Login = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Expense Tracker
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#b0b0b0",
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Track your monthly expenses
          </Typography>
          <Input id="email" label="Email" variant="outlined" />
          <Input id="password" label="Password" variant="outlined" />
          <Button label="Sign in" variant="contained" />
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
