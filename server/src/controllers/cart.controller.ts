import { Request, Response } from "express";
import CartItem, { ICartItem } from "../models/cartItem.schema.js";
import Cart, { ICart } from "../models/cart.schema.js";
import { Types } from "mongoose";
import Book, { IBook } from "../models/book.schema.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResolve.js";

export const addItemToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { bookId, price } = req.body;
  const userId = req.user?._id;

  try {
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized: Please log in to add items to your cart",
      });
      return;
    }

    if (!bookId || typeof price !== "number" || price <= 0) {
      res.status(400).json({ message: "Invalid book ID or price" });
      return;
    }

    let cart = await Cart.findOne({ userId }).populate("cartItem");
    if (!cart) {
      cart = new Cart({ userId });
    } else {
      const existingItem = await CartItem.findOne({ cartId: cart._id, bookId });
      if (existingItem) {
        res.status(409).json({ message: "Book is already in your cart" });
        return;
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

    res.status(201).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart", error });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cartItemId, rentDays, purchaseType } = req.body;
  const userId = req.user?._id;

  console.log("rentDays", cartItemId, rentDays, purchaseType);

  try {
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

      console.log("cart", cart);
      await cart.save();
    }

    res
      .status(200)
      .json(new ApiResponse(200, cartItem, "Cart item updated successfully"));
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw new ApiError(500, "Error updating cart item");
  }
};

export const removeItemFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, cartItemId } = req.body;

  try {
    const cartItem = await CartItem.findById(cartItemId);

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    // Find the user's cart and remove the item
    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.cartItem = cart.cartItem.filter(
        (item) => item.toString() !== cartItemId
      );
      cart.totalPrice -= cartItem.price;
      cart.totalItem -= 1;
      await cart.save();
      await CartItem.findByIdAndDelete(cartItemId);

      res.status(200).json({ message: "Item removed from cart", cart });
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart", error });
  }
};

// Get the cart for a user
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?._id;

  try {
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
        .json(new ApiResponse(202, { cartItem: [] }, "Cart is empty"));
      return;
    }

    res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
  } catch (error) {
    throw new ApiError(500, "Error getting cart");
  }
};

// Clear all items from the cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Delete all items in the cart and reset totals
    await CartItem.deleteMany({ cartId: cart._id });
    cart.cartItem = [];
    cart.totalPrice = 0;
    cart.totalItem = 0;

    await cart.save();
    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
};
