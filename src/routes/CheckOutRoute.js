import express from "express";
import { createCheckout, getCheckouts, updateCheckout, approveCheckout, rejectCheckout } from "../controllers/CheckOut.js";
import { verifyToken, verifyMember, verifyAdmin, verifyAdminOrMember} from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/checkout", verifyToken, verifyMember , createCheckout);
router.get("/api/checkouts", verifyToken, verifyAdminOrMember , getCheckouts);
router.patch("/api/checkout/:id", verifyToken, verifyAdmin, updateCheckout);
router.patch("/api/checkout/approve/:id", verifyToken, verifyAdmin, approveCheckout);
router.patch("/api/checkout/reject/:id", verifyToken, verifyAdmin, rejectCheckout);

export default router;
