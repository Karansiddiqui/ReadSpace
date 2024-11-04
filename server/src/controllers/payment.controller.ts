import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResolve.js";
import User from "../models/user.schema.js";
import { stripe } from "../utils/stripe.js";

import dotenv from "dotenv";

dotenv.config();

const createStripeSession = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;
  const userId = req.user?._id;

  const user = await User.findOne({ _id: userId }).select("-password");

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, { message: "User not found" }));
  }

  const lineItems = cartItems.cartItem.map((item: any) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item.bookId.bookName,
          description:
            item.purchaseType === "rent"
              ? `Rent for ${item.rentDays} day(s)`
              : "Purchase",
          images: [item.bookId.cover],
        },
        unit_amount: item.price * 100,
      },
      quantity: 1,
    };
  });

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/articles`,
      cancel_url: `${process.env.FRONTEND_URL}/articles-plans`,
      customer: user.customerStripeId,
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
    },
    {
      apiKey: process.env.STRIPE_SECRET_KEY,
    }
  );

  return res.status(200).json(new ApiResponse(200, session, "Payment completed"));
});

export { createStripeSession };
