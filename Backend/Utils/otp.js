import crypto from "node:crypto";
import bcrypt from "bcrypt";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

/** 6-digit code from a CSPRNG — Math.random is predictable and unsafe here. */
export const generateOtp = () =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

/** Stored hashed, so a database leak doesn't hand over live codes. */
export const hashOtp = (otp) => bcrypt.hash(otp, 10);

export const compareOtp = (otp, hash) => bcrypt.compare(otp, hash);

export const otpExpiry = () =>
  new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
