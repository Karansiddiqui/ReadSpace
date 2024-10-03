import { Router } from "express";
import {
  createTransaction,
  findBookByUserAndDateRange,
  getUserBook,
  returnBook,
  totalRentGeneratedByBook,
} from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/veriftUser.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = Router();

router.use(verifyJWT);

router.post("/issue", createTransaction);

router.get("/userBooks", getUserBook);

router.post("/return", returnBook);
router.post("/totalRentGeneratedByBook", checkAdmin, totalRentGeneratedByBook);
router.get("/findBookByUserAndDateRange", findBookByUserAndDateRange);

export default router;
