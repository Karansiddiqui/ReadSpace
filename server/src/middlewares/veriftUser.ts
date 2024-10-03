import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.schema.js";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.schema.js";

interface RequestWithUser extends Request {
  user: IUser;
}

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized access");
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );

      const user = await User.findById((decodedToken as JwtPayload)._id).select(
        "-password"
      );

      if (!user) {
        throw new ApiError(403, "Invalid Access Token");
      }

      const reqWithUser = req as RequestWithUser;
      reqWithUser.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid Access Token");
    }
  }
);
