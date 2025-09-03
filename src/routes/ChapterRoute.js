import express from "express";
import multer from "multer";

import {
  createChapter,
  getChapters,
  getChapterById,
  getChaptersByCategory,
  getChaptersByBook,
  updateChapter,
  deleteChapter,
  checkoutChapter,
  getChaptersByCheckoutBy,
  uploadPaymentProof,
  getWaitingChapters,
  approveChapter,
 downloadChapterTemplate,
 importChapter
} from "../controllers/Chapter.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// CREATE
router.post("/api/chapters/create-chapter", createChapter);

// READ ALL
router.post("/api/chapters/get-all-chapters", getChapters);

// READ BY ID
router.post("/api/chapters/get-chapter-by-id", getChapterById);

// READ BY CATEGORY ID
router.post("/api/chapters/get-chapter-by-category-id", getChaptersByCategory);

// READ BY BOOK ID
router.post("/api/chapters/get-chapter-by-book-id", getChaptersByBook);

// UPDATE
router.post("/api/chapters/update-chapter", updateChapter);

// DELETE
router.post("/api/chapters/delete-chapter", deleteChapter);

// CHECKOUT
router.post("/api/chapters/checkout-chapter", checkoutChapter);
router.post("/api/chapters/personal-checkout", getChaptersByCheckoutBy);

// DELETE
router.post("/api/chapters/payment_proof", uploadPaymentProof);

// NEED APPROVE LIST
router.post("/api/chapters/waiting-chapter", getWaitingChapters);
router.post("/api/chapters/approval-chapter", approveChapter);

// Excel
router.get("/api/chapters/template", downloadChapterTemplate);
router.post("/api/chapters/import", upload.single("file"), importChapter);

export default router;
