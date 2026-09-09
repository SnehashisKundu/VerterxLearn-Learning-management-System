import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  createQuiz,
  getModuleQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "./qz.service";
import {
  createQuizSchema,
  updateQuizSchema,
} from "./qz.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = createQuizSchema.parse(req.body);

    const quiz = await createQuiz(
      authReq.user.userId,
      authReq.user.role,
      req.params.moduleId as string,
      data
    );

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "Module not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this quiz"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const quizzes = await getModuleQuizzes(
      authReq.user.userId,
      authReq.user.role,
      req.params.moduleId as string
    );

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quizzes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Module not found" ||
      message === "Course is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this quiz"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOne = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const quiz = await getQuizById(
      authReq.user.userId,
      authReq.user.role,
      req.params.id as string
    );

    return res.status(200).json({
      message: "Quiz fetched successfully",
      quiz,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Quiz not found" ||
      message === "Course is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this quiz"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const update = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = updateQuizSchema.parse(req.body);

    const quiz = await updateQuiz(
      authReq.user.userId,
      authReq.user.role,
      req.params.id as string,
      data
    );

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "Quiz not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this quiz"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const remove = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await deleteQuiz(
      authReq.user.userId,
      authReq.user.role,
      req.params.id as string
    );

    return res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "Quiz not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this quiz"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};