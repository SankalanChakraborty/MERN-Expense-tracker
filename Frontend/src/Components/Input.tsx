import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

interface InputProps {
  id: string;
  label: string;
  variant?: "outlined" | "filled" | "standard";
  type?: string;
}

export default function BasicTextFields({
  id,
  label,
  variant = "outlined",
  type,
}: InputProps) {
  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        id={id}
        label={label}
        variant={variant}
        type={type}
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#666666",
            },
            "&:hover fieldset": {
              borderColor: "#888888",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2196F3",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#999999",
            opacity: 1,
          },
          "& .MuiInputLabel-root": {
            color: "#b0b0b0",
            "&.Mui-focused": {
              color: "#2196F3",
            },
          },
        }}
      />
    </Box>
  );
}
