import { useEffect, useId, useRef } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  /** Blocks dismissal and shows a pending label while the action runs. */
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  // Escape to dismiss, and lock background scroll while the dialog is up.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isBusy, onCancel]);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={() => !isBusy && onCancel()}
      role="presentation"
    >
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id={titleId} className="confirm-title">
          {title}
        </h3>
        <p id={messageId} className="confirm-message">
          {message}
        </p>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`confirm-accept ${tone === "danger" ? "tone-danger" : ""}`}
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
