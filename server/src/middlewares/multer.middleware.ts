import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request, Response } from "express";
import path from "path";

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const dest = "./public/temp";
    cb(null, dest);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileNameOriginal = `${uniqueSuffix}-${file.originalname}`;

    cb(null, fileNameOriginal);
  },
});

export const upload = multer({
  storage,
});
