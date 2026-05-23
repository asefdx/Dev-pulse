import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as issuesService from "./issues.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
      throw new AppError("title, description, type are required", 400);
    }
    if (!["bug", "feature_request"].includes(type)) {
      throw new AppError("type must be bug or feature_request", 400);
    }
    if (title.length > 150) {
      throw new AppError("title must be 150 characters or less", 400);
    }
    if (description.length < 20) {
      throw new AppError("description must be at least 20 characters", 400);
    }

    const issue = await issuesService.createIssue(
      title,
      description,
      type,
      req.user!.id,
    );
    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const getAllIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { sort = "newest", type, status } = req.query;
    const issues = await issuesService.getAllIssues(
      sort as string,
      type as string | undefined,
      status as string | undefined,
    );
    sendSuccess(res, StatusCodes.OK, "Issues fetched successfully", issues);
  } catch (err) {
    next(err);
  }
};

export const getIssueById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid issue ID", 400);
    const issue = await issuesService.getIssueById(id);
    sendSuccess(res, StatusCodes.OK, "Issue fetched successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const updateIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid issue ID", 400);
    const { title, description, type } = req.body;
    const issue = await issuesService.updateIssue(
      id,
      { title, description, type },
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const deleteIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid issue ID", 400);
    await issuesService.deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
  } catch (err) {
    next(err);
  }
};