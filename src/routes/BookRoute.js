import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/Book.js";
import { verifyToken, verifyAdmin } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/books", verifyToken, verifyAdmin, createBook);
router.get("/api/books", getBooks);
router.get("/api/books/:id", getBookById);
router.patch("/api/books/:id", verifyToken, verifyAdmin, updateBook);
router.delete("/api/books/:id", verifyToken, verifyAdmin, deleteBook);

export default router;
