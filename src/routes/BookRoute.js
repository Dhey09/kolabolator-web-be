import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  getBookByCategoryId,
  updateBook,
  deleteBook,
  updateBookStatus
} from "../controllers/Book.js";

const router = express.Router();


// CREATE Book
router.post("/api/books/create-book", createBook);

// GET ALL Books
router.post("/api/books/get-all-books", getAllBooks);

// GET Book by ID
router.post("/api/books/get-book-by-id", getBookById);

// GET Book by Category ID
router.post("/api/books/get-book-by-category", getBookByCategoryId);

// UPDATE Book
router.post("/api/books/update-book", updateBook);

// DELETE Book
router.post("/api/books/delete-book", deleteBook);

// DELETE Book
router.post("/api/books/update-book-status", updateBookStatus);

export default router;
