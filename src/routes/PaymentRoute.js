import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/Payment.js";
import { verifyToken } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/payments/create-payment", createPayment);
router.post("/api/payments/get-all-payments", getAllPayments);
router.post("/api/payments/get-payment-by-id", getPaymentById);
router.post("/api/payments/update-payment", updatePayment);
router.post("/api/payments/delete-payment", deletePayment);

export default router;
