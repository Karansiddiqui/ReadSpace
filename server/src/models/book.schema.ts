import mongoose, { Document, Schema } from "mongoose";

export interface IBook extends Document {
  bookName: string;
  category: string;
  rentPerDay: number;
  cover: string;
  issued: string;
  slug: string;
}

const BookSchema: Schema = new Schema(
  {
    bookName: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    rentPerDay: { type: Number, required: true },
    cover: { type: String, required: false },

    slug: {
      type: String,
      unique: true,
      required: function (this: IBook) {
        return this.isNew;
      },
    },
  },
  { timestamps: true }
);

// Create the Book model
const Book = mongoose.model<IBook>("Book", BookSchema);

export default Book;
