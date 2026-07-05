import Button from "@mui/material/Button";

interface ButtonProps {
  label: string;
  variant?: "text" | "outlined" | "contained";
}

export default function ButtonUsage({
  label,
  variant = "contained",
}: ButtonProps) {
  return (
    <Button
      variant={variant}
      fullWidth
      sx={{
        py: 1.5,
        fontSize: "1rem",
        fontWeight: "600",
        textTransform: "capitalize",
        ...(variant === "contained" && {
          backgroundColor: "#2196F3",
          "&:hover": {
            backgroundColor: "#1976D2",
          },
        }),
        ...(variant === "outlined" && {
          borderColor: "#2196F3",
          color: "#2196F3",
          "&:hover": {
            backgroundColor: "rgba(33, 150, 243, 0.08)",
          },
        }),
      }}
    >
      {label}
    </Button>
  );
}

