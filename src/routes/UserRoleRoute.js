import express from "express";
import {
  createUserRole,
  getUserRoles,
  getUserRoleById,
  updateUserRole,
  deleteUserRole,
} from "../controllers/UserRole.js";
import {verifyToken } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/user-roles", createUserRole);
router.get("/api/user-roles", verifyToken, getUserRoles);
router.get("/api/user-roles/:id", verifyToken, getUserRoleById);
router.patch("/api/user-roles/:id", verifyToken, updateUserRole);
router.delete("/api/user-roles/:id", verifyToken, deleteUserRole);

export default router;
