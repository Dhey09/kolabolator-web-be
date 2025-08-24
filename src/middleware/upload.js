import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// fungsi factory untuk buat upload sesuai folder
export const makeUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName, // folder sesuai input
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
  });

  return multer({ storage });
};
