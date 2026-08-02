import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import "../Styles/Login.css";
import "../Styles/VerifyEmail.css";
import Button from "../Components/Button";
import WebInfo from "../Components/WebInfo";
import type { ToastProps } from "../Components/Toast";
import { verifyOtp, resendOtp } from "../api/auth";
import { ApiError } from "../api/client";

interface VerifyEmailProps {
  setToastMessage: (message: ToastProps) => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const VerifyEmail = ({ setToastMessage }: VerifyEmailProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Set by RegisterUser/Login on redirect; falls back to ?email= so the page
  // survives a refresh.
  const emailFromState = (location.state as { email?: string } | null)?.email;
  const emailFromQuery = new URLSearchParams(location.search).get("email");
  const email = emailFromState ?? emailFromQuery ?? "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // Nothing to verify without an address — send them back to sign up.
  if (!email) return <Navigate to="/register" replace />;

  const code = digits.join("");

  const setDigitAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (!value) return setDigitAt(index, "");

    // Typing or pasting several digits at once fills forward from here.
    if (value.length > 1) {
      const chars = value.slice(0, OTP_LENGTH - index).split("");
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((char, offset) => {
          next[index + offset] = char;
        });
        return next;
      });
      inputsRef.current[Math.min(index + chars.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    setDigitAt(index, value);
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== OTP_LENGTH) {
      setToastMessage({
        message: `Enter all ${OTP_LENGTH} digits`,
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await verifyOtp(email, code);
      setToastMessage({ message: data.message, severity: "success" });
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not verify that code. Try again.";
      setToastMessage({ message, severity: "error" });
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      const data = await resendOtp(email);
      setToastMessage({ message: data.message, severity: "info" });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Could not resend the code.";
      setToastMessage({ message, severity: "error" });
    }
  };

  return (
    <div className="login-container">
      <WebInfo />
      <div className="login-form">
        <div className="welcome-header">
          <h3>Check your inbox</h3>
          <span>
            We sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                className="otp-digit"
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={OTP_LENGTH}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="auth-button"
            icon={faShieldHalved}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying…" : "Verify email"}
          </Button>
        </form>

        <div className="otp-resend">
          <span>Didn't get it?</span>
          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <div className="create-new-account">
          <p>
            Wrong address? <Link to="/register">Sign up again</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
