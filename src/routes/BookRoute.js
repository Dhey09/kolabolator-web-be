import express from "express";
import multer from "multer";
import {
  createBook,
  getAllBooks,
  getBookById,
  getBookByCategoryId,
  updateBook,
  deleteBook,
  updateBookStatus,
  downloadBookTemplate,
  importBook
} from "../controllers/Book.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });


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

router.get("/api/books/template", downloadBookTemplate);
router.post("/api/books/import", upload.single("file"), importBook);

export default router;
