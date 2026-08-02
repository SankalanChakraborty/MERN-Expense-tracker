import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  icon?: IconProp;
}

const Button = ({
  type = "button",
  children,
  className = "",
  icon,
  ...rest
}: ButtonProps) => {
  return (
    // `rest` forwards disabled, aria-*, form, etc. — without it those props are
    // accepted by the type but silently dropped.
    <button type={type} className={`button ${className}`} {...rest}>
      {icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </button>
  );
};

export default Button;
