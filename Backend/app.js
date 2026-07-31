import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./Routes/user.routes.js";
import expenseRouter from "./Routes/expense.route.js";
import budgetRouter from "./Routes/budget.route.js";
import { API_BASE_URI } from "./enum.js";
import { errorHandler } from "./Middlewares/auth.middleware.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(`${API_BASE_URI.ROUTE}/auth`, userRouter);
app.use(`${API_BASE_URI.ROUTE}/expense`, expenseRouter);
app.use(`${API_BASE_URI.ROUTE}/budget`, budgetRouter);
app.use(errorHandler);
export default app;
