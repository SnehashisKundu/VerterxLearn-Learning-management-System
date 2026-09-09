import type { Request, Response } from "express";
import { createAnswerSchema } from "./qans.validation";
import * as answerService from "./qans.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: Parameters<typeof answerService.getAttemptAnswers>[1];
  };
};

export async function create(
  req: Request,
  res: Response
) {
  try {
    const request = req as AuthenticatedRequest;
    const attemptId = req.params.attemptId as string;

    const result = createAnswerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (!request.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const answer = await answerService.createAnswer(
      request.user.userId,
      attemptId,
      result.data
    );

    return res.status(201).json({
      message: "Quiz answer saved successfully",
      answer,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save quiz answer";

    if (
      message === "Quiz attempt not found" ||
      message === "Question not found"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message === "You do not have access to this attempt" ||
      message === "Question does not belong to this quiz" ||
      message ===
        "One or more selected options are invalid"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message === "Quiz attempt has already been submitted"
    ) {
      return res.status(409).json({
        message,
      });
    }

    console.error("Create answer error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const request = req as AuthenticatedRequest;
    const attemptId = req.params.attemptId as string;

    if (!request.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const answers =
      await answerService.getAttemptAnswers(
        request.user.userId,
        request.user.role,
        attemptId
      );

    return res.status(200).json({
      answers,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get quiz answers";

    if (message === "Quiz attempt not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message === "You do not have access to this attempt" ||
      message ===
        "You do not have permission to view answers"
    ) {
      return res.status(403).json({
        message,
      });
    }

    console.error("Get answers error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function submit(
  req: Request,
  res: Response
) {
  try {
    const request = req as AuthenticatedRequest;
    const attemptId = req.params.attemptId as string;

    if (!request.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await answerService.submitAttempt(
      request.user.userId,
      attemptId
    );

    return res.status(200).json({
      message: "Quiz submitted successfully",
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit quiz";

    if (
      message === "Quiz attempt not found" ||
      message === "Quiz has no questions"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message === "You do not have access to this attempt"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message === "Quiz attempt has already been submitted"
    ) {
      return res.status(409).json({
        message,
      });
    }

    console.error("Submit attempt error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}