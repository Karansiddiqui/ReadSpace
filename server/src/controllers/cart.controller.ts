import { Request, Response } from "express";
import CartItem, { ICartItem } from "../models/cartItem.schema.js";
import Cart, { ICart } from "../models/cart.schema.js";
import { Types } from "mongoose";
import Book, { IBook } from "../models/book.schema.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResolve.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addItemToCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { bookId, price } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(
        401,
        "Unauthorized: Please log in to add items to your cart"
      );
    }

    if (!bookId || typeof price !== "number" || price <= 0) {
      res.status(400).json({ message: "Invalid book ID or price" });
      throw new ApiError(400, "Invalid book ID or price");
    }

    let cart = await Cart.findOne({ userId }).populate("cartItem");
    if (!cart) {
      cart = new Cart({ userId });
    } else {
      const existingItem = await CartItem.findOne({ cartId: cart._id, bookId });
      if (existingItem) {
        throw new ApiError(409, "Book is already in your cart");
      }
    }

    const cartItem = new CartItem({
      cartId: cart._id,
      bookId,
      price,
      userId,
    });
    await cartItem.save();

    cart.cartItem.push(cartItem._id as ICartItem);
    cart.totalPrice += price;
    cart.totalItem += 1;
    await cart.save();


    const cartItems = (await Cart.findOne({ userId }).populate({
      path: "cartItem",
      populate: {
        path: "bookId",
        model: "Book",
      },
    })) as ICart;
    res.status(200).json(new ApiResponse(200, cartItems, "Item added to your cart"));
  }
);

export const updateCartItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { cartItemId, rentDays, purchaseType } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized: Please log in to update items in your cart",
      });
      return;
    }

    if (!cartItemId || typeof rentDays !== "number" || rentDays <= 0) {
      throw new ApiError(400, "Invalid cart item ID or rent days");
    }

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      throw new ApiError(404, "Cart item not found");
    }

    const book = await Book.findById(cartItem.bookId);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    let newRentPrice;
    if (purchaseType === "rent") {
      newRentPrice = (book.rentPerDay ?? 0) * rentDays;
    } else {
      newRentPrice = book.oneTimePrice ?? 0;
    }

    cartItem.rentDays = rentDays;
    cartItem.price = newRentPrice;

    if (purchaseType) {
      cartItem.purchaseType = purchaseType;
    }

    await cartItem.save();

    const cart = await Cart.findOne({ userId }).populate({
      path: "cartItem",
      populate: {
        path: "bookId",
        model: "Book",
      },
    });
    if (cart) {
      cart.totalPrice = cart.cartItem.reduce((total, item: ICartItem) => {
        if (item.purchaseType === "buy" && item.bookId) {
          return total + (item.bookId.oneTimePrice || 0);
        }
        return total + (item.price || 0);
      }, 0);
      await cart.save();
    }

    res
      .status(200)
      .json(new ApiResponse(200, cartItem, "Cart item updated successfully"));
  }
);

export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { cartItemId } = req.body;
    const userId = req.user?._id;

    const cartItem = await CartItem.findById(cartItemId);

    if (!cartItem) {
      throw new ApiError(404, "Cart item not found");
    }

    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.cartItem = cart.cartItem.filter(
        (item) => item.toString() !== cartItemId
      );
      cart.totalPrice -= cartItem.price;
      cart.totalItem -= 1;
      await cart.save();
      await CartItem.findByIdAndDelete(cartItemId);
      res.status(200).json(new ApiResponse(200, [], "Item removed from cart"));
    } else {
      throw new ApiError(404, "Cart not found");
    }
  }
);

export const getCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized: Please log in to view your cart");
    }
    const cart = (await Cart.findOne({ userId }).populate({
      path: "cartItem",
      populate: {
        path: "bookId",
        model: "Book",
      },
    })) as ICart;

    if (!cart) {
      res
        .status(202)
        .json(new ApiResponse(202, null, "Cart is empty"));
      return;
    }

    res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
  }
);

// Clear all items from the cart
export const clearCart = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
      return;
    }

    await CartItem.deleteMany({ cartId: cart._id });
    cart.cartItem = [];
    cart.totalPrice = 0;
    cart.totalItem = 0;

    await cart.save();
    res.status(200).json(new ApiResponse(200, [], "Cart cleared successfully"));
  }
);
