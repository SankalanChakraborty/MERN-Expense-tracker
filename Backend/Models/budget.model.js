import mongoose from "mongoose";
import ExpenseType from "../enum.js";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      trim: true,
      required: true,
      enum: Object.values(ExpenseType),
    },
    // Standing monthly cap for this category — not scoped to a single month.
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

// One budget per category per user; the upsert in setBudget relies on this.
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

const budgetModel = mongoose.model("Budget", budgetSchema);
export default budgetModel;
