import express from "express";
import {
 getAllTransaction
} from "../controllers/TransactionHistory.js";
import { verifyToken } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/roles/get-all-transaction", getAllTransaction);

export default router;
