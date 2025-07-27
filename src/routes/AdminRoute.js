import express from "express";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../controllers/Admin.js";
import { verifyToken, verifyAdmin } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/:roleId/admin", verifyToken, verifyAdmin, createAdmin);
router.get("/api/admins", verifyToken, verifyAdmin, getAdmins);
router.get("/api/admin/:id", verifyToken, verifyAdmin, getAdminById);
router.patch("/api/admin/:id", verifyToken, verifyAdmin, updateAdmin);
router.delete("/api/admin/:id", verifyToken, verifyAdmin, deleteAdmin);

export default router;
