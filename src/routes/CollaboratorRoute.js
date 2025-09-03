import express from "express";
import {
  getAllCollaborators,
  getCollaboratorById,
  getCollaboratorByChapter,
  getPersonalCollaborator,
  updateCollaboratorData,
  approveCollaborator,
  sendBackCollaborator,
  getPendingCollaborators,
} from "../controllers/Collaborator.js";

const router = express.Router();

// Other routes
router.post("/api/collaborators/get-all-collaborators", getAllCollaborators);
router.post("/api/collaborators/get-collaborator-by-id", getCollaboratorById);
router.post(
  "/api/collaborators/get-collaborator-by-chapter",
  getCollaboratorByChapter
);
router.post(
  "/api/collaborators/get-personal-collaborator",
  getPersonalCollaborator
);
router.post("/api/collaborators/update-collaborator", updateCollaboratorData);
router.post("/api/collaborators/approve-collaborator", approveCollaborator);
router.post(
  "/api/collaborators/need-update-collaborator",
  sendBackCollaborator
);
router.post(
  "/api/collaborators/get-collaborator-by-pending",
  getPendingCollaborators
);

export default router;
