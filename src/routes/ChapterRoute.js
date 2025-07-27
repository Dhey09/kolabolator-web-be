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
  verifyAdmin,
  verifyMember,
  verifyToken,
} from "../middleware/authUser.js";

const router = express.Router();

router.post(
  "/api/books/:bookId/chapters",
  verifyToken,
  verifyAdmin,
  createChapter
);
router.get("/api/chapters", getChapters);
router.get("/api/books/:bookId/chapters", getChaptersByBookId);
router.get("/api/chapters/:id", getChapterById);
router.patch("/api/chapters/:id", verifyToken, verifyAdmin, updateChapter);
router.delete("/api/chapters/:id", verifyToken, verifyAdmin, deleteChapter);
router.post(
  "/api/chapters/:id/checkout",
  verifyToken,
  verifyMember,
  checkOut
);

export default router;
