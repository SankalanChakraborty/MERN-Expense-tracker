import mongoose from "mongoose";
import ExpenseType from "../enum.js";
const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // title: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   maxlength: 100,
    // },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      required: true,
      enum: Object.values(ExpenseType),
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const expenseModel = mongoose.model("Expense", expenseSchema);
export default expenseModel;
