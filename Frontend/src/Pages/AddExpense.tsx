import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

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
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: submit expense data
    console.log({ title, amount, category, date, note, recurring });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Add expense
            </Typography>
            <Button variant="text">X</Button>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              fullWidth
              //   InputProps={{
              //     startAdornment: (
              //       <InputAdornment position="start">₹</InputAdornment>
              //     ),
              //   }}
            />

            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={category}
                label="Category"
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              fullWidth
              //   InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              multiline
              rows={4}
              placeholder="Optional note"
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={recurring}
                  onChange={(event) => setRecurring(event.target.checked)}
                />
              }
              label="Recurring monthly"
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 1,
              }}
            >
              <Button variant="outlined" type="button">
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Save expense
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddExpense;
