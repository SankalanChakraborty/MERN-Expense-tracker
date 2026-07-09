import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Models/user.model.js";
import { errorHandler } from "../Middlewares/auth.middleware.js";

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

  const user = await User.findOne({ email });
  if (user) {
    return res
      .status(400)
      .json({ status: "error", message: "User already exists" });
  }
  // Hash the password and save the user
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    userName,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
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
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!user || !isPasswordValid) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid email or password" });
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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
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
    const user = await User.findById(decoded.userId);
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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ status: "success", message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};

export const userLogout = async (req, res, next) => {
  const { id } = req.user;
  try {
    await User.findByIdAndUpdate(id, { refreshToken: null });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ status: "success", message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
