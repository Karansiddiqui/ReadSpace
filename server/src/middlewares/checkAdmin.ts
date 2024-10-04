// middlewares/checkAdmin.js
import { NextFunction, Request, Response } from "express";
import {ApiError} from "../utils/ApiError.js";

const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  
  if (!req.user?.isAdmin) {
    return next(new ApiError(403, "Access denied. Admins only."));
  }
  next();
};

export default checkAdmin;
