import express from "express";
import {
  addExpense,
  getExpenses,
  editExpense,
  deleteExpense,
} from "../Controllers/expense.controller.js";
import { authenticateToken } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get("/expenses", authenticateToken, getExpenses);
router.post("/add", authenticateToken, addExpense);
router.patch("/:id", authenticateToken, editExpense);
router.delete("/:id", authenticateToken, deleteExpense);

export default router;
