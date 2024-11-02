import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  bookId: mongoose.Schema.Types.ObjectId;
  issueDate: [Date];
  returnDate: [Date];
  rentAmount: [number];
  purchesdType: "rent" | "buy";
  status: "rented" | "returned";
}

const transactionSchema: Schema<ITransaction> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    issueDate: [{ type: Date, required: true }],
    returnDate: [{ type: Date, default: null }],
    purchesdType: {
      type: String,
      enum: ["rent", "buy"],
      required: true,
    },
    status: { type: String, enum: ["rented", "returned"], default: "rented" },
    rentAmount: [{ type: Number }],
  },
  { timestamps: true }
);

transactionSchema.set("toJSON", {
  transform: function (doc, ret) {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    ret.lastCreated = new Date().toLocaleString("en-IN", options);
    return ret;
  },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
