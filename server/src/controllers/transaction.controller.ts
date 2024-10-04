import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import Transaction from "../models/transaction.schema.js";
import { ApiResponse } from "../utils/ApiResolve.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.schema.js";
import Book from "../models/book.schema.js";
import mongoose from "mongoose";

function currentDate(): Date {
  let time = new Date();
  let indianTime = new Date(time.getTime() + 5.5 * 60 * 60 * 1000);
  return indianTime;
}

const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { bookId, days } = req.body;

  if (!bookId || !days || days <= 0) {
    throw new ApiError(400, "Missing required fields or invalid days.");
  }

  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, "Book not found.");
  }

  const existingTransaction = await Transaction.findOne({
    bookId,
    userId: req.user?._id,
  });

  if (existingTransaction) {
    const isRented = existingTransaction.status === "rented";
    const isReturned = existingTransaction.status === "returned";

    if (isRented) {
      throw new ApiError(400, "Already rented a book.");
    }

    if (isReturned) {
      const returnDate = currentDate();
      returnDate.setDate(returnDate.getDate() + days);
      existingTransaction.status = "rented";
      existingTransaction.issueDate.push(currentDate());
      existingTransaction.rentAmount.push(book.rentPerDay * days);
      existingTransaction.returnDate.push(returnDate);
      await existingTransaction.save();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingTransaction,
            "Book Re-rented successfully"
          )
        );
    }
  }

  const issueDate = currentDate();
  const returnDate = new Date(issueDate);
  returnDate.setDate(returnDate.getDate() + days);

  let rentAmount = book.rentPerDay * days;
  const newTransaction = new Transaction({
    userId: req.user?._id,
    bookId,
    issueDate,
    returnDate,
    rentAmount: [rentAmount],
  });

  try {
    await newTransaction.save();
    return res
      .status(201)
      .json(new ApiResponse(200, newTransaction, "Book Rented Successfully"));
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw new ApiError(500, "Error creating transaction.");
  }
});

// Get all transactions for a user
// - List of people who have issued that book in the past ( total
//   count), the person who currently has that book issued ( currently issued
//   only) or status of not issued at the moment.

const getUserBook = asyncHandler(async (req: Request, res: Response) => {
  if (req.query) {
    const { bookId, status, rented, userId } = req.query;
    const isAdmin = req.user?.isAdmin; // Check if the user is an admin

    const query = {
      ...(bookId && { bookId: new mongoose.Types.ObjectId(bookId as string) }),
      ...(rented && { status: rented as string }),
      // ...(bookId  && {returnDate: { $exists: true, $ne: [] }}),
      ...(userId && { userId: userId }),
    };

    const transaction = await Transaction.find(query)
      .sort({ updatedAt: -1 })
      .populate("bookId")
      .populate("userId");
    // console.log("transcont", transaction);
    // console.log(req.query);

    if (rented) {
      // console.log("rented");

      for (const trans of transaction) {
        if (trans.returnDate[trans?.returnDate?.length - 1] <= currentDate()) {
          // console.log(trans.returnDate[trans?.returnDate?.length - 1], currentDate());

          trans.status = "returned";
          await trans.save();
          // console.log("returned");
        }
      }
    }

    if (!transaction) {
      throw new ApiError(404, "Not rented by anyone");
    }

    const pastUser = transaction.filter((field) => {
      if (field?.status === "returned" || field?.returnDate.length > 1) {
        return field;
      }
    });
    const currentHoldingBookUser = transaction.filter((field) => {
      if (field?.status === "rented") {
        return field;
      }
    });
    const totalPastUsers = pastUser.length;
    const totalCurrentUsers = currentHoldingBookUser.length;

    let totalRent = 0;
    pastUser.forEach((trans) => {
      totalRent = trans.rentAmount.reduce((a, b) => a + b, 0);
    });

    currentHoldingBookUser.forEach((item) => {
      totalRent += item.rentAmount.reduce((a, b) => a + b);
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          pastUser,
          totalPastUsers,
          currentHoldingBookUser,
          transaction,
          totalCurrentUsers,
          totalRent,
        },
        "User finded"
      )
    );
  } else {
    const transactions = await Transaction.find({
      userId: req.user?._id,
    })
      .populate("bookId")
      .populate("userId");

    if (!transactions) {
      throw new ApiError(404, "No transactions found for this user.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, transactions, "Transactions fetched successfully")
      );
  }
});

const findBookByUserAndDateRange = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstDate, secondDate, userId, rangeType } = req.query;

    let firstDateParsed: Date | null = null;
    let secondDateParsed: Date | null = null;

    const today = new Date();
    if (rangeType === "today") {
      firstDateParsed = new Date();
      secondDateParsed = new Date();
    } else if (rangeType === "1week") {
      firstDateParsed = new Date(today.setDate(today.getDate() - 7));
      secondDateParsed = new Date();
    } else {
      if (firstDate) {
        if (typeof firstDate !== "string") {
          throw new ApiError(400, "First date must be a string.");
        }
        firstDateParsed = parseDate(firstDate);
        if (!firstDateParsed) {
          throw new ApiError(
            400,
            "Invalid first date format. Please use DD-MM-YY."
          );
        }
      }

      if (secondDate) {
        if (typeof secondDate !== "string") {
          throw new ApiError(400, "Second date must be a string.");
        }
        secondDateParsed = parseDate(secondDate);
        if (!secondDateParsed) {
          throw new ApiError(
            400,
            "Invalid second date format. Please use DD-MM-YY."
          );
        }
      }
    }

    if (firstDateParsed && secondDateParsed) {
      if (firstDateParsed > secondDateParsed) {
        throw new ApiError(
          400,
          "Invalid date range. First date must be earlier than the second date."
        );
      }
    }

    // console.log(firstDateParsed, secondDateParsed);

    const query: any = {};

    if (firstDateParsed && secondDateParsed) {
      query.issueDate = { $gte: firstDateParsed, $lte: secondDateParsed };
    } else if (firstDateParsed) {
      query.issueDate = { $gte: firstDateParsed };
    } else if (secondDateParsed) {
      query.issueDate = { $lte: secondDateParsed };
    }

    // console.log(query);

    const transactions = await Transaction.find(query)
      .populate("bookId")
      .populate("userId");

    const totalTransaction = transactions.length;

    if (totalTransaction <= 0) {
      throw new ApiError(
        404,
        "No transactions found for the specified date range."
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, transactions, "Transactions fetched successfully")
      );
  }
);

// Function to parse the date in DD-MM-YY format
const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null; // Ensure we have exactly 3 parts
  const [day, month, year] = parts;

  const fullYear = year.length === 2 ? `20${year}` : year;

  const date = new Date(`${fullYear}-${month}-${day}`);

  return isNaN(date.getTime()) ? null : date;
};

// Function to parse the date in DD-MM-YY format

// Return a book
const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(
      404,
      "No ongoing transaction found for this book and user."
    );
  }
  if (transaction.status === "returned") {
    throw new ApiError(400, "This book is already returned.");
  }
  const book = await Book.findById(transaction.bookId);

  if (!book) {
    throw new ApiError(404, "No book found");
  }

  transaction.status = "returned";
  // const issuedDateLength = transaction.issueDate.length;

  // const rentDays = Math.ceil(
  //   (currentDate().getTime() -
  //     new Date(transaction.issueDate[issuedDateLength - 1]).getTime()) /
  //     (1000 * 3600 * 24)
  // );
  // transaction.rentAmount.push(rentDays * book.rentPerDay);
  // console.log(rentDays * book.rentPerDay);
  // transaction.returnDate.push(currentDate());

  await transaction.save();

  res
    .status(200)
    .json(new ApiResponse(200, transaction, "Book Returned Successfully"));
});

const totalRentGeneratedByBook = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.query;
    const transaction = await Transaction.find({ bookId });
    if (!transaction) {
      throw new ApiError(404, "No Transaction found");
    }

    console.log(transaction);

    let totalRent = 0;
    transaction.forEach((item) => {
      totalRent += item.rentAmount.reduce((a, b) => a + b);
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { totalRent: totalRent },
          "Rent calculated Successfully"
        )
      );
  }
);

export {
  createTransaction,
  getUserBook,
  returnBook,
  totalRentGeneratedByBook,
  findBookByUserAndDateRange,
};
