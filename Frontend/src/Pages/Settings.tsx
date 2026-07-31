import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type { ToastProps } from "../Components/Toast";
import type { CurrencyCode } from "../types";
import { useAuth } from "../context/AuthContext";
import { CURRENCIES, formatCurrency } from "../utils/currency";
import { ApiError } from "../api/client";
import "../Styles/Settings.css";

interface SettingsProps {
  setToastMessage: (message: ToastProps) => void;
}

const SAMPLE_AMOUNT = 124500;

const Settings = ({ setToastMessage }: SettingsProps) => {
  const { user, updateCurrency } = useAuth();
  const [saving, setSaving] = useState<CurrencyCode | null>(null);

  const active = user?.currency ?? "INR";

  const handleSelect = async (code: CurrencyCode) => {
    if (code === active || saving) return;

    setSaving(code);
    try {
      await updateCurrency(code);
      setToastMessage({
        message: `Currency switched to ${code}`,
        severity: "success",
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to update currency.";
      setToastMessage({ message, severity: "error" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Preferences</span>
          <h2>Settings</h2>
          <span className="page-subtitle">
            Choose how amounts are displayed across Expensely.
          </span>
        </div>
      </div>

      <section className="settings-section">
        <div className="settings-section-head">
          <h3>Currency</h3>
          <p>
            Applies to every amount in the app. Existing entries are not
            converted — only the symbol and number formatting change.
          </p>
        </div>

        <div className="currency-grid">
          {CURRENCIES.map((currency) => {
            const isActive = currency.code === active;
            return (
              <button
                key={currency.code}
                type="button"
                className={`currency-option ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(currency.code)}
                disabled={saving !== null}
                aria-pressed={isActive}
              >
                <span className="currency-symbol">{currency.symbol}</span>
                <span className="currency-meta">
                  <span className="currency-code">{currency.code}</span>
                  <span className="currency-label">{currency.label}</span>
                </span>
                {isActive && (
                  <span className="currency-check">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                )}
                {saving === currency.code && (
                  <span className="currency-saving">Saving…</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="currency-preview">
          <span>Preview</span>
          <strong>{formatCurrency(SAMPLE_AMOUNT, active)}</strong>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-head">
          <h3>Account</h3>
          <p>Signed in as</p>
        </div>
        <div className="account-row">
          <span className="account-label">Name</span>
          <span className="account-value">{user?.userName}</span>
        </div>
        <div className="account-row">
          <span className="account-label">Email</span>
          <span className="account-value">{user?.email}</span>
        </div>
      </section>
    </>
  );
};

export default Settings;
