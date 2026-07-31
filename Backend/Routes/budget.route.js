import express from "express";
import {
  getBudgets,
  setBudget,
  deleteBudget,
} from "../Controllers/budget.controller.js";
import { authenticateToken } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get("/budgets", authenticateToken, getBudgets);
router.put("/set", authenticateToken, setBudget);
router.delete("/:id", authenticateToken, deleteBudget);

export default router;
