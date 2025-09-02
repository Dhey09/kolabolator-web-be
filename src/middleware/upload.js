import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Factory function untuk membuat uploader dengan folder sesuai kebutuhan
export const makeUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName, // folder Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "webp", "svg", "ic"],
    },
  });

  return multer({ storage });
};

// Uploader khusus
export const uploadBook = makeUploader("book");
export const uploadCategory = makeUploader("category");
export const uploadChapter = makeUploader("chapter");
export const uploadCheckout = makeUploader("checkout");
export const uploadUser = makeUploader("user");
export const uploadPaymentProof = makeUploader("payment");
export const uploadScript = makeUploader("script", ["pdf", "doc", "docx"]);
export const uploadHaki = makeUploader("haki", ["pdf", "doc", "docx"]);
export const uploadIdentity = makeUploader("identity", [
  "jpg",
  "jpeg",
  "png",
  "webp",
]);

// Uploader khusus Template (pdf, word, dll)
export const uploadTemplate = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "template", // folder di Cloudinary
      resource_type: "raw", // penting untuk pdf/word/zip dll
      allowed_formats: ["pdf", "doc", "docx", "xls", "xlsx"],
    },
  }),
});

export const uploadCollab = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "collaborator",
      resource_type: "auto", // auto: pdf, doc, docx, jpg, png, dll
      allowed_formats: ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"],
    },
  }),
});
