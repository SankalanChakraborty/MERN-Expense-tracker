import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  icon?: IconProp;
  onclick?: () => void;
}

const Button = ({
  type = "button",
  onClick,
  children,
  className = "",
  icon,
}: ButtonProps) => {
  return (
    <button type={type} onClick={onClick} className={`button ${className}`}>
      {icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </button>
  );
};

export default Button;
