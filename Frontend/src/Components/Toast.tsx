import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "./Toast.css";

export interface ToastProps {
  message: string;
  severity: string;
}

const Toast = ({ message, severity }: ToastProps) => {
  const iconMap: Record<string, IconDefinition> = {
    success: faCircleCheck,
    error: faCircleExclamation,
    info: faCircleInfo,
    warning: faTriangleExclamation,
  };

  const icon = iconMap[severity] || faCircleInfo;

  return (
    <div className={`toast-container ${severity}`}>
      <FontAwesomeIcon icon={icon} />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
