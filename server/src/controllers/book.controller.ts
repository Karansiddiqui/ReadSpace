import { Request, Response } from "express";
import Book from "../models/book.schema.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResolve.js";
import mongoose from "mongoose";

// Create a new book
export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const { bookName, category, rentPerDay } = req.body;
  let coverUrl: string | null = null;

  if (!rentPerDay || rentPerDay === undefined) {
    throw new ApiError(400, "All fields are required");
  }
  if ([bookName, category].some((field) => field?.trim() === "" || !field)) {
    throw new ApiError(400, "All fields are required");
  }

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult) {
      coverUrl = uploadResult.secure_url;
    }
  }

  const slug = req.body.bookName
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  const newBook = new Book({
    bookName,
    category,
    rentPerDay,
    cover: coverUrl,
    slug,
  });

  await newBook.save();

  const checkBook = await Book.find({
    bookName: "The Great Gatsby",
    category: "Fiction",
  });
  if (!checkBook) {
    throw new ApiError(409, "Book not created");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, checkBook, "Book Created Successfully"));
});

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  const minRent = Number(req.query.minRent === "" ? NaN : req.query.minRent);
  const maxRent = Number(req.query.maxRent === "" ? NaN : req.query.maxRent);

  // Check if minRent and maxRent are provided and valid
  if (!isNaN(minRent) && !isNaN(maxRent) && minRent >= maxRent) {
    throw new ApiError(400, "Min Rent should be less than Max Rent");
  }

  const sortDirection = req.query.sort === "asc" ? 1 : -1;
  const limit = Number(req.query.limit) || 20;

  // Construct the query object
  const query: any = {
    ...(req.query.bookId && { _id: req.query.bookId }),
    ...(req.query.category && { category: req.query.category }),
    ...(req.query.slug && { slug: req.query.slug }),
    ...(req.query.searchTerm && {
      $or: [
        { bookName: { $regex: req.query.searchTerm, $options: "i" } },
        { category: { $regex: req.query.searchTerm, $options: "i" } },
      ],
    }),
  };

  if (!isNaN(minRent)) {
    query.rentPerDay = { ...query.rentPerDay, $gte: minRent };
  }

  if (!isNaN(maxRent)) {
    query.rentPerDay = { ...query.rentPerDay, $lte: maxRent };
  }

  const books = await Book.find(query)
    .sort({ createdAt: sortDirection })
    .limit(limit);

  if (!books || books.length === 0) {
    throw new ApiError(404, "No books found");
  }

  const now = new Date();

  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const lastMonthBooks = await Book.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  const totalBooks = books.length;
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { books, totalBooks, lastMonthBooks },
        "All books retrieved successfully"
      )
    );
});

export const getBookById = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id: bookId } = req.params;
    console.log(bookId);

    if (!bookId) {
      throw new ApiError(400, "Book ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new ApiError(400, "Invalid Book ID format");
    }
    const book = await Book.findById(bookId);

    if (!book) {
      console.log("book");
      throw new ApiError(404, "Book not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, book, "Book retrieved successfully"));
  }
);
