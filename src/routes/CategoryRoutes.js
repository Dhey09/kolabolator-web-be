import express from "express";
import {
  createCategory,
  getCategorys,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/Category.js";
import {verifyToken } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/create-categories", createCategory);
router.get("/api/get-categories", verifyToken, getCategorys);
router.get("/api/get-categories/:id", verifyToken, getCategoryById);
router.patch("/api/update-categories/:id", verifyToken, updateCategory);
router.delete("/api/delete-categories/:id", verifyToken, deleteCategory);

export default router;
