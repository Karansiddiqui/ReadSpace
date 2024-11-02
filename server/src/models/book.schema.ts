import mongoose, { Document, Schema } from "mongoose";

export interface IBook extends Document {
  bookName: string;
  author: string;
  description: string;
  category: string;
  rentPerDay: number;
  oneTimePrice?: number;
  publicationYear: number;
  topic: string;
  cover?: string;
  issued?: string;
  slug: string;
}

const BookSchema: Schema = new Schema(
  {
    bookName: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    rentPerDay: { type: Number, required: true },
    oneTimePrice: { type: Number, required: false },
    publicationYear: { type: Number, required: true },
    topic: { type: String, required: true },
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
