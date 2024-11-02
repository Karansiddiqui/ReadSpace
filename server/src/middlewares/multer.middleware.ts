import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

// Ensure the upload directory exists
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "public", "temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log("file", file.originalname);
    
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
});
