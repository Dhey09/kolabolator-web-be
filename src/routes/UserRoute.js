import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/User.js";

const router = express.Router();

router.post("/api/users/create-user", createUser);
router.post("/api/users/get-all-users", getAllUsers);
router.post("/api/users/get-user-by-id", getUserById);
router.post("/api/users/update-user", updateUser);
router.post("/api/users/delete-user", deleteUser);

export default router;
