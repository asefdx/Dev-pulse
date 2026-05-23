import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(" Error:", err.message);
  console.error("Stack:", err.stack);

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  console.error("Unexpected Error:", {
    message: err.message,
    name: err.name,
    stack: err.stack,
  });

  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Something went wrong: " + err.message,
  );
};