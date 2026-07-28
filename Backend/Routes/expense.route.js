import express from "express";
import { addExpense } from "../Controllers/expense.controller.js";
import { authenticateToken } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", authenticateToken, addExpense);

export default router;
