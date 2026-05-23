import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "./auth.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new AppError("name, email, password are required", 400);
    }
    if (!role) {
      throw new AppError("role is required (contributor or maintainer)", 400);
    }
    if (!["contributor", "maintainer"].includes(role)) {
      throw new AppError("role must be contributor or maintainer", 400);
    }

    const user = await authService.registerUser(name, email, password, role);
    sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }

    const data = await authService.loginUser(email, password);
    sendSuccess(res, StatusCodes.OK, "Login successful", data);
  } catch (err) {
    next(err);
  }
};