import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/Book.js";
import { verifyToken,  } from "../middleware/authUser.js";

const router = express.Router();

router.post("/api/books", verifyToken, createBook);
router.get("/api/books", getBooks);
router.get("/api/books/:id", getBookById);
router.patch("/api/books/:id", verifyToken, updateBook);
router.delete("/api/books/:id", verifyToken, deleteBook);

export default router;
