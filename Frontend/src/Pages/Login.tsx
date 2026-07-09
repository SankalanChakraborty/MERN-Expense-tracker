import {
  Box,
  Typography,
  Container,
  Link,
  Paper,
  TextField,
  Button,
} from "@mui/material";

const Login = () => {
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
              Expense Tracker
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
              Track your monthly expenses
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField id="email" label="Email" variant="outlined" fullWidth />
            <TextField
              id="password"
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
            />
            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              Sign in
            </Button>
          </Box>

          <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
            Don't have an account?{" "}
            <Link href="/register" underline="hover" color="primary">
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
