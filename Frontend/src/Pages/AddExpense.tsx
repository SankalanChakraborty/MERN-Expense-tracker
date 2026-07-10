import { useState } from "react";

const categories = [
  "Groceries",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Health",
  "Rent",
  "Other",
];

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ amount, category, date, note, recurring });
  };

  return (
    <div>
      <div>
        <h2>Add expense</h2>
        <button type="button">X</button>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

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

        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <label htmlFor="note">Note</label>
        <textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Optional note"
        />

        <label>
          <input
            type="checkbox"
            checked={recurring}
            onChange={(event) => setRecurring(event.target.checked)}
          />
          Recurring monthly
        </label>

        <div>
          <button type="button">Cancel</button>
          <button type="submit">Save expense</button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
