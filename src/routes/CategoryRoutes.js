import express from "express";
import multer from "multer";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  downloadCategoryTemplate,
  importCategory
} from "../controllers/Category.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

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

//download template
router.get("/api/categories/template", downloadCategoryTemplate);
router.post("/api/categories/import", upload.single("file"), importCategory);



export default router;
