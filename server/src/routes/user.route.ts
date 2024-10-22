import { Router } from "express";
import {
  registerUser,
  loginUser,
  signout,
  getUser,
  getAllUser,
} from "../controllers/usre.controller.js"; // Adjust the import path as necessary
import { verifyJWT } from "../middlewares/veriftUser.js"; // Adjust the import path as necessary
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", signout);

router.get("/me", verifyJWT, getUser);
router.get("/getAllUser", verifyJWT, checkAdmin, getAllUser);

export default router;