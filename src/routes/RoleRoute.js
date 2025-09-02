import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/Role.js";
import { verifyToken } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/roles/create-role", createRole);
router.post("/api/roles/get-all-roles", getAllRoles);
router.post("/api/roles/get-role-by-id", getRoleById);
router.post("/api/roles/update-role", updateRole);
router.post("/api/roles/delete-role", deleteRole);

export default router;
