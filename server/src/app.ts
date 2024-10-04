import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/book.route.js";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/ApiError.js";
import userRoutes from "./routes/user.route.js";
import userTransaction from "./routes/transaction.route.js";
import path from "path";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api/books", bookRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transaction", userTransaction);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.use((error: ApiError, req: Request, res: Response, next: NextFunction) => {
  const errorMessage = error.message || "Something went wrong";
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    data: [],
    errors: error.errors || [],
  });
});

export { app };
