import { Request, Response } from "express";
import Book from "../models/book.schema.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResolve.js";
import mongoose from "mongoose";

type Fields = {
  bookName?: string;
  category?: string;
  rentPerDay?: number;
  publicationYear?: number;
  topic?: string;
  author?: string;
  description?: string;
  oneTimePrice?: number;
};

// Create a new book
export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const trimFields = (fields: Fields) => {
    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim().replace(/\s+/g, ' ') : value,
      ])
    );
  };

  const {
    bookName,
    category,
    rentPerDay,
    publicationYear,
    topic,
    author,
    description,
    oneTimePrice,
  } = trimFields(req.body);
  let coverUrl: string | null = null;

  if (typeof bookName !== "string") {
    throw new ApiError(400, "bookName must be a string");
  }
  // Validation for required fields
  if (
    [bookName, category, topic, author, description].some((field) => !field) ||
    !rentPerDay ||
    !publicationYear
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // If an image file is provided, upload to Cloudinary
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult) {
      coverUrl = uploadResult.secure_url;
    }
  }

  // Generate a URL-friendly slug from the book name
  const slug = bookName
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  // Create a new book document
  const newBook = new Book({
    bookName,
    author,
    description,
    category,
    rentPerDay,
    oneTimePrice,
    publicationYear,
    topic,
    cover: coverUrl,
    slug,
  });

  // Save the new book to the database
  await newBook.save();

  // Check if the book was created successfully
  const checkBook = await Book.findOne({ bookName, category });
  if (!checkBook) {
    throw new ApiError(409, "Book not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, checkBook, "Book Created Successfully"));
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if ID is provided
  if (!id) {
    throw new ApiError(400, "Book ID is required");
  }

  const {
    bookName,
    author,
    description,
    publicationYear,
    topic,
    category,
    rentPerDay,
    oneTimePrice,
    cover,
  } = req.body;

  console.log(req);

  let coverUrl: string | null = null;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    console.log("uploadResult", uploadResult);
    if (uploadResult) {
      coverUrl = uploadResult.secure_url;
    }
  } else {
    coverUrl = cover;
  }

  // Update book in the database
  const updatedBook = await Book.findByIdAndUpdate(
    id,
    {
      $set: {
        bookName,
        author,
        description,
        publicationYear,
        topic,
        category,
        rentPerDay,
        oneTimePrice,
        cover: coverUrl,
      },
    },
    { new: true }
  );

  // Check if book was found and updated
  if (!updatedBook) {
    throw new ApiError(404, "Book not found");
  }

  // Return updated book
  return res
    .status(200)
    .json(new ApiResponse(200, updatedBook, "Book updated successfully"));
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
  let books;
  req.query?.recentBooks && req.query?.limit
    ? (books = await Book.find(query).sort({ createdAt: 1 }).limit(limit))
    : (books = await Book.find(query)
        .sort({ createdAt: sortDirection })
        .limit(limit));

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

  const totalBooks = await Book.countDocuments();
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

    if (!bookId) {
      throw new ApiError(400, "Book ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new ApiError(400, "Invalid Book ID format");
    }
    const book = await Book.findById(bookId);

    if (!book) {
      // console.log("book");
      throw new ApiError(404, "Book not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, book, "Book retrieved successfully"));
  }
);

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("id", id);

  if (!id) {
    throw new ApiError(400, "Book ID is required");
  }
  const book = await Book.findById(id);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }
  const deletedBook = await Book.findByIdAndDelete(id);
  if (!deletedBook) {
    throw new ApiError(404, "Book not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, deletedBook, "Book deleted successfully"));
});
