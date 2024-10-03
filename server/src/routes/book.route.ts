import { Router } from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
} from "../controllers/book.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import { verifyJWT } from "../middlewares/veriftUser.js";

const router = Router();

router.post(
  "/create",
  verifyJWT,
  checkAdmin,
  upload.single("cover"),
  createBook
);

router.get("/get", getAllBooks);

router.get("/getBookById/:id", getBookById);

export default router;
