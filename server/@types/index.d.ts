import { IUser } from "../models/user.schema.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}