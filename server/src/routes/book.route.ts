import { Router } from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
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

router.delete("/delete/:id", deleteBook);

router.put(
  "/update/:id",
  verifyJWT,
  checkAdmin,
  upload.single("cover"),
  updateBook
);

export default router;
