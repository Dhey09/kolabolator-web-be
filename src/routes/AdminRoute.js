import express from "express";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../controllers/Admin.js";
import { verifyToken,  } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/:roleId/admin",createAdmin);
router.get("/api/admins", verifyToken, getAdmins);
router.get("/api/admin/:id", verifyToken, getAdminById);
router.patch("/api/admin/:id", verifyToken, updateAdmin);
router.delete("/api/admin/:id", verifyToken, deleteAdmin);

export default router;
