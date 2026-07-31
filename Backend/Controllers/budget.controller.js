import ExpenseType from "../enum.js";
import Budget from "../Models/budget.model.js";

const VALID_CATEGORIES = Object.values(ExpenseType);

export const getBudgets = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const budgets = await Budget.find({ user: userId }).sort({ category: 1 });

    return res.json({
      status: "success",
      message: "Budgets fetched successfully",
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upsert the monthly cap for a single category. Sending the same category
 * again overwrites the existing limit rather than creating a duplicate.
 */
export const setBudget = async (req, res, next) => {
  try {
    const { category, amount } = req.body;

    if (!category || amount === undefined || amount === null) {
      return res.status(400).json({
        status: "error",
        message: "Category and amount are required",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid category" });
    }

    if (Number(amount) < 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Amount cannot be negative" });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.userId, category },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.json({
      status: "success",
      message: "Budget saved",
      budget,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findById(id);
    if (!budget || budget.user.toString() !== req.user.userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Budget not found" });
    }

    await budget.deleteOne();

    return res.json({ status: "success", message: "Budget removed", id });
  } catch (error) {
    next(error);
  }
};
