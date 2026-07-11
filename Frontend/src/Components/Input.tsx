import "./Input.css";

interface InputProps {
  id?: string;
  name?: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className,
}: InputProps) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`input-field ${className || ""}`.trim()}
    />
  );
};

export default Input;
