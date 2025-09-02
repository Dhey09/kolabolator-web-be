import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/Category.js";

const router = express.Router();

// CREATE
router.post("/api/categories/create-category", createCategory);

// READ ALL
router.post("/api/categories/get-all-categories", getCategories);

// READ BY ID
router.post("/api/categories/get-category-by-id", getCategoryById);

// UPDATE
router.post("/api/categories/update-category", updateCategory);

// DELETE
router.post("/api/categories/delete-category", deleteCategory);

export default router;
