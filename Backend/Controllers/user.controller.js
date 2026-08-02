import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/user.model.js";
import cookieOptions from "../Utils/cookieOptions.js";
import { SUPPORTED_CURRENCIES } from "../enum.js";
import { sendVerificationEmail } from "../Utils/mailer.js";
import {
  generateOtp,
  hashOtp,
  compareOtp,
  otpExpiry,
  OTP_MAX_ATTEMPTS,
} from "../Utils/otp.js";

export const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("_id userName email currency")
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        currency: user.currency ?? "INR",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { currency } = req.body;

    if (!currency || !SUPPORTED_CURRENCIES.includes(currency)) {
      return res
        .status(400)
        .json({ status: "error", message: "Unsupported currency" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { currency },
      { new: true, runValidators: true },
    )
      .select("_id userName email currency")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    return res.json({
      status: "success",
      message: "Preferences updated",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req, res, next) => {
  const { userName, email, password, confirmPassword } = req.body;
  if (!userName || !email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ status: "error", message: "Passwords do not match" });
  }

  try {
    const existing = await User.findOne({ email });

    // An unverified signup isn't a real account yet — let the address be
    // reclaimed rather than stranding it because someone typo'd and abandoned it.
    if (existing && existing.isVerified) {
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpFields = {
      otpHash: await hashOtp(otp),
      otpExpiresAt: otpExpiry(),
      otpAttempts: 0,
    };

    if (existing) {
      existing.set({ userName, password: hashedPassword, ...otpFields });
      await existing.save();
    } else {
      await User.create({
        userName,
        email,
        password: hashedPassword,
        isVerified: false,
        ...otpFields,
      });
    }

    await sendVerificationEmail(email, userName, otp);

    return res.status(201).json({
      status: "success",
      message: "Verification code sent. Check your inbox.",
      email,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ status: "error", message: "Email and code are required" });
  }

  try {
    const user = await User.findOne({ email }).select(
      "+otpHash +otpExpiresAt +otpAttempts",
    );

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "No account found for this email" });
    }

    if (user.isVerified) {
      return res.json({
        status: "success",
        message: "Email already verified. You can sign in.",
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        status: "error",
        message: "No active code. Request a new one.",
        code: "OTP_NOT_FOUND",
      });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        status: "error",
        message: "That code has expired. Request a new one.",
        code: "OTP_EXPIRED",
      });
    }

    // Cap guesses so a 6-digit code can't be brute forced within its lifetime.
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        status: "error",
        message: "Too many incorrect attempts. Request a new code.",
        code: "OTP_ATTEMPTS_EXCEEDED",
      });
    }

    const matches = await compareOtp(String(otp), user.otpHash);

    if (!matches) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = Math.max(OTP_MAX_ATTEMPTS - user.otpAttempts, 0);
      return res.status(400).json({
        status: "error",
        message: remaining
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
          : "Too many incorrect attempts. Request a new code.",
        code: "OTP_INVALID",
      });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.json({
      status: "success",
      message: "Email verified. You can sign in now.",
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: "error", message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    // Same response whether or not the address exists, so this endpoint can't
    // be used to enumerate registered users.
    const genericResponse = {
      status: "success",
      message: "If that account needs verification, a new code is on its way.",
    };

    if (!user || user.isVerified) return res.json(genericResponse);

    const otp = generateOtp();
    user.otpHash = await hashOtp(otp);
    user.otpExpiresAt = otpExpiry();
    user.otpAttempts = 0;
    await user.save();

    await sendVerificationEmail(email, user.userName, otp);

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid email or password" });
  }

  // Checked only after the password is confirmed, so this can't be used to
  // discover which addresses are registered. The code lets the client route
  // straight to the verification screen.
  if (!user.isVerified) {
    return res.status(403).json({
      status: "error",
      message: "Verify your email before signing in.",
      code: "EMAIL_NOT_VERIFIED",
      email: user.email,
    });
  }

  if (
    !process.env.JWT_SECRET_ACCESS_TOKEN ||
    !process.env.JWT_SECRET_REFRESH_TOKEN
  ) {
    return res
      .status(500)
      .json({ status: "error", message: "Server misconfiguration" });
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    {
      expiresIn: "7d",
    },
  );

  try {
    // Save to database for revocation/rotation
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        currency: user.currency ?? "INR",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: "error", message: "Refresh token is missing" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN,
    );
    // `refreshToken` is `select: false` on the schema, so it must be asked for
    // explicitly — without this the field comes back undefined and the
    // comparison below rejects every refresh.
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ status: "error", message: "Invalid refresh token" });
    }
    //   Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "15m",
      },
    );
    //   Set the new access token in a cookie
    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ status: "success", message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};

export const userLogout = async (req, res, next) => {
  const { userId } = req.user;
  try {
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).json({ status: "success", message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
