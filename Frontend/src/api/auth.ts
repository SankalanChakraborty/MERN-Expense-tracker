import { apiRequest } from "./client";
import type { CurrencyCode, User } from "../types";

interface UserResponse {
  status: string;
  message?: string;
  user: User;
}

export const login = (email: string, password: string) =>
  apiRequest<UserResponse>("/auth/login", { method: "POST", body: { email, password } });

export const register = (
  userName: string,
  email: string,
  password: string,
  confirmPassword: string,
) =>
  apiRequest<{ status: string; message: string; email: string }>(
    "/auth/register",
    {
      method: "POST",
      body: { userName, email, password, confirmPassword },
    },
  );

export const verifyOtp = (email: string, otp: string) =>
  apiRequest<{ status: string; message: string }>("/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });

export const resendOtp = (email: string) =>
  apiRequest<{ status: string; message: string }>("/auth/resend-otp", {
    method: "POST",
    body: { email },
  });

export const logout = () =>
  apiRequest<{ status: string; message: string }>("/auth/logout", { method: "POST" });

export const getCurrentUser = () => apiRequest<UserResponse>("/auth/me");

export const updatePreferences = (currency: CurrencyCode) =>
  apiRequest<UserResponse>("/auth/preferences", {
    method: "PATCH",
    body: { currency },
  });
