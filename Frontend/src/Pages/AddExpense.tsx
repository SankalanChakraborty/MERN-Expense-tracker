import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../Components/Input";
import "../Styles/AddExpense.css";

const categories = [
  "Groceries",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Health",
  "Rent",
  "Other",
];

interface AddExpenseProps {
  setShowAddExpense: (state: boolean) => void;
}

const AddExpense = ({ setShowAddExpense }: AddExpenseProps) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState(false);

  const hideAddExpenseModal = () => {
    setShowAddExpense(false);
  };

  const handleSaveNewExpense = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("Expense save logic goes here");
    console.log({ amount, category, date, note, recurring });
  };

  return (
    <div className="add-expense-page">
      <div
        className="add-expense-modal-overlay"
        role="dialog"
        aria-modal="true"
      >
        <div className="add-expense-modal">
          <div className="add-expense-modal-header">
            <div>
              <p className="add-expense-eyebrow">New entry</p>
              <h2>Add expense</h2>
            </div>
            <button
              type="button"
              className="close-button"
              onClick={hideAddExpenseModal}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form className="add-expense-form" onSubmit={handleSaveNewExpense}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="note">Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Optional note"
                />
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
              />
              Recurring monthly
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={hideAddExpenseModal}
              >
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                Save expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
