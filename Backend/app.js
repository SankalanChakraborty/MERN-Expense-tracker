import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./Routes/user.routes.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use("/api/auth", userRouter);

export default app;
