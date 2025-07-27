import express from "express";
import {
  createUserRole,
  getUserRoles,
  getUserRoleById,
  updateUserRole,
  deleteUserRole,
} from "../controllers/UserRole.js";
import { verifyAdmin, verifyToken } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/user-roles", verifyToken, verifyAdmin, createUserRole);
router.get("/api/user-roles", verifyToken, verifyAdmin, getUserRoles);
router.get("/api/user-roles/:id", verifyToken, verifyAdmin, getUserRoleById);
router.patch("/api/user-roles/:id", verifyToken, verifyAdmin, updateUserRole);
router.delete("/api/user-roles/:id", verifyToken, verifyAdmin, deleteUserRole);

export default router;
