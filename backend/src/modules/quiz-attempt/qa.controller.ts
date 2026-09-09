import type { Request, Response } from "express";
import { createAttemptSchema } from "./qa.validation";
import * as attemptService from "./qa.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: any;
  };
};

export async function create(req: Request, res: Response) {
  try {
    const quizId = req.params.quizId as string;
    const user = (req as AuthenticatedRequest).user;

    const result = createAttemptSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attempt = await attemptService.createAttempt(
      user.userId,
      quizId
    );

    return res.status(201).json({
      message: "Quiz attempt started successfully",
      attempt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to start quiz attempt";

    if (
      message === "Quiz not found"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "This quiz is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Create attempt error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const quizId = req.params.quizId as string;
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attempts = await attemptService.getQuizAttempts(
      user.userId,
      user.role,
      quizId
    );

    return res.status(200).json({
      attempts,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get quiz attempts";

    if (message === "Quiz not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "This quiz is not available" ||
      message === "You are not enrolled in this course" ||
      message === "You do not have access to this quiz" ||
      message === "You do not have permission to view attempts"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Get attempts error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const attemptId = req.params.id as string;
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attempt = await attemptService.getAttemptById(
      user.userId,
      user.role,
      attemptId
    );

    return res.status(200).json({
      attempt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get quiz attempt";

    if (message === "Quiz attempt not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have access to this attempt" ||
      message === "This quiz is not available" ||
      message === "You do not have permission to view this attempt"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Get attempt error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}