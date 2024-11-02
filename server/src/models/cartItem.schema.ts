import mongoose, { Document, Schema, Model } from "mongoose";
import { IBook } from "./book.schema.js";
// Define an interface representing a CartItem document in MongoDB
interface ICartItem extends Document {
  cartId: mongoose.Types.ObjectId;
  bookId: IBook;
  price: number;
  purchaseType: "rent" | "buy";
  userId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  rentDays: number;
}

// Define the schema corresponding to the document interface
const cartItemSchema: Schema<ICartItem> = new Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchaseType: {
      type: String,
      enum: ["rent", "buy"],
      required: true,
      default: "buy",
    },
    rentDays: { type: Number, default: 1 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model for the CartItem interface
const CartItem: Model<ICartItem> = mongoose.model<ICartItem>(
  "CartItems",
  cartItemSchema
);

export default CartItem;
export { ICartItem };
