import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
//   requestResetPassword,
//   resetPassword,
} from "../controllers/User.js";
import { verifyToken} from "../middleware/authUser.js";

const router = express.Router();

// Semua CRUD pakai POST
router.post("/api/users/create-user", createUser);
router.post("/api/users/get-all-users", verifyToken, getAllUsers);
router.post("/api/users/get-user-by-id", getUserById);
router.post("/api/users/update-user", updateUser);
router.post("/api/users/delete-user", deleteUser);

// // Reset password pakai OTP
// router.post("/api/users/request-reset", requestResetPassword);
// router.post("/api/users/reset-password", resetPassword);

export default router;
