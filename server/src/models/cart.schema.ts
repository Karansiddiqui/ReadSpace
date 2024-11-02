import mongoose, { Document, Schema, Model } from "mongoose";
import { ICartItem } from "./cartItem.schema.js";
// Define an interface representing a Cart document in MongoDB
interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  cartItem: ICartItem[];
  totalPrice: number;
  totalItem: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema for a Cart document
const CartSchema: Schema<ICart> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItem: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartItems",
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalItem: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create the model for the Cart interface
const Cart: Model<ICart> = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
export{ICart};