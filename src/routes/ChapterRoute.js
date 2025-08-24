import express from "express";
import {
  createChapter,
  getChapters,
  getChaptersByBookId,
  getChapterById,
  updateChapter,
  deleteChapter,
  checkOut,
} from "../controllers/Chapter.js";
import {
  
  verifyToken,
} from "../middleware/authUser.js";

const router = express.Router();

router.post(
  "/api/books/:bookId/chapters",
  verifyToken,
  createChapter
);
router.get("/api/chapters", getChapters);
router.get("/api/books/:bookId/chapters", getChaptersByBookId);
router.get("/api/chapters/:id", getChapterById);
router.patch("/api/chapters/:id", verifyToken, updateChapter);
router.delete("/api/chapters/:id", verifyToken, deleteChapter);
router.post(
  "/api/chapters/:id/checkout",
  verifyToken,
  
  checkOut
);

export default router;
