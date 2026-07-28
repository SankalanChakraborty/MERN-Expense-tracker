import ExpenseType from "../enum.js";
import Expense from "../Models/expense.model.js";

export const getExpenses = async (req, res) => {};

export const addExpense = async (req, res, next) => {
  try {
    const { amount, category, date, note } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({
        status: "error",
        message: "Amount, category, and date are required",
      });
    }

    const expense = await Expense.create({
      user: req.user.userId,
      amount,
      category,
      date,
      note,
    });

    return res.status(201).json({
      status: "success",
      message: "New expense added",
      expense,
    });
  } catch (error) {
    next(error);
  }
};
