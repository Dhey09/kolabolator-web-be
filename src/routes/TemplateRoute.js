import express from "express";
import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  downloadHakiTemplate,
  downloadScriptTemplate,
} from "../controllers/Template.js";

const router = express.Router();

// Upload 2 field: script & haki
router.post("/api/templates/create-template", createTemplate);

router.post("/api/templates/get-all-templates", getAllTemplates);
router.post("/api/templates/get-template-by-id", getTemplateById);

router.post("/api/templates/update-template", updateTemplate);

router.post("/api/templates/delete-template", deleteTemplate);
router.post("/api/templates/download-haki", downloadHakiTemplate);
router.post("/api/templates/download-script", downloadScriptTemplate);

export default router;
