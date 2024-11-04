import { Router } from "express";
import { verifyJWT } from "../middlewares/veriftUser.js";
import { createStripeSession } from "../controllers/payment.controller.js";

const router = Router();

router.post("/stripe-session", verifyJWT, createStripeSession);

export default router;
