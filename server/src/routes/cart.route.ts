import { Router } from "express";
import {
  addItemToCart,
  getCart,
  removeItemFromCart,
  clearCart,
  updateCartItem
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/veriftUser.js";

const router = Router();


router.get("/get", verifyJWT, getCart);

router.patch("/update/:id", verifyJWT, updateCartItem);

router.post("/addItemToCart", verifyJWT, addItemToCart);

router.delete("/clearCart", verifyJWT, clearCart);

router.delete("/removeItemFromCart", verifyJWT, removeItemFromCart);

export default router;
