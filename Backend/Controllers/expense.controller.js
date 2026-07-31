import ExpenseType from "../enum.js";
import Expense from "../Models/expense.model.js";

export const getExpenses = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    return res.json({
      status: "success",
      message: "Expenses fetched successfully",
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

export const addExpense = async (req, res, next) => {
  try {
    const { amount, category, date, note, recurring } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all the mandatory fields",
      });
    }

    const expense = await Expense.create({
      user: req.user.userId,
      amount,
      category,
      date,
      note,
      recurring,
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

export const editExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, category, date, note, recurring } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all the mandatory fields",
      });
    }

    const expense = await Expense.findById(id);
    if (!expense || expense.user.toString() !== req.user.userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Expense not found" });
    }

    expense.amount = amount;
    expense.category = category;
    expense.date = date;
    expense.note = note;
    expense.recurring = recurring ?? false;
    await expense.save();

    return res.json({
      status: "success",
      message: "Expense updated",
      expense,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense || expense.user.toString() !== req.user.userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Expense not found" });
    }

    await expense.deleteOne();

    return res.json({
      status: "success",
      message: "Expense deleted",
      id,
    });
  } catch (error) {
    next(error);
  }
};
