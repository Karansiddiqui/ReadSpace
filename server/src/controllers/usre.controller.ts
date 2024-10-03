import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.schema.js";
import { ApiResponse } from "../utils/ApiResolve.js";
import { ApiError } from "../utils/ApiError.js";
import Book from "../models/book.schema.js";

// Register User
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    fullName,
    isAdmin,
  }: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    isAdmin: boolean;
  } = req.body;

  if (
    [username, email, password, fullName].some(
      (field) => field?.trim() === "" || !field
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    fullName,
    isAdmin,
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

// Login User
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  if ([email, password].some((field) => field?.trim() === "" || !field)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Email does not exist");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }
  console.log(email, password);

  const accessToken = user.generateAccessToken();
  const loggedInUser = await User.findById(user._id).select("-password");

  const cookieOptions: { httpOnly: boolean; secure: boolean } = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});

// Sign Out
const signout = (req: Request, res: Response, next: NextFunction) => {
  try {
    res
      .clearCookie("accessToken")
      .status(200)
      .json(new ApiResponse(200, "User logged out successfully"));
  } catch (error) {
    next(error);
  }
};

import { IUser } from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
// Get User
const getUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json(new ApiError(401, "Unauthorized access"));
  }

  const user = await User.findOne({ email: req.user.email }).select(
    "-password"
  );
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, { user }));
});

const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.isAdmin) {
    throw new ApiError(404, "You are not allowed to access users");
  }
  const startIndex = parseInt(req.query.startIndex as string) || 0;
  const limit = parseInt(req.query.limit as string) || 9;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  if (req.query.bookId) {
    const bookId = req.query.bookId;

    const book = await Book.findById(bookId);
    if (!book) throw new ApiError(404, "Book not found");

    const issuedBookUser = await Transaction.find({ bookId: book._id });
    const totalUsers = issuedBookUser.length;

    if (!issuedBookUser) throw new ApiError(404, "User not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { issuedBookUser, totalUsers },
          "Users who rented this book fetched successfully"
        )
      );
  } else {
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .select("-password");

    if (!users) throw new ApiError(404, "Users not found");
    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { users, totalUsers, lastMonthUsers },
          "Users fetched successfully"
        )
      );
  }
});

export { registerUser, loginUser, signout, getUser, getAllUser };
