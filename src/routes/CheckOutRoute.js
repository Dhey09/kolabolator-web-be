import express from "express";
import { createCheckout, getCheckouts, updateCheckout, approveCheckout, rejectCheckout } from "../controllers/CheckOut.js";
import { verifyToken} from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/checkout", verifyToken , createCheckout);
router.get("/api/checkouts", verifyToken , getCheckouts);
router.patch("/api/checkout/:id", verifyToken, updateCheckout);
router.patch("/api/checkout/approve/:id", verifyToken, approveCheckout);
router.patch("/api/checkout/reject/:id", verifyToken, rejectCheckout);

export default router;
