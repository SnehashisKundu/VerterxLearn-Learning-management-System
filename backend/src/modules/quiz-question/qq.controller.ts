import type { Request, Response } from "express";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "./qq.validation";
import * as questionService from "./qq.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: string;
  };
};

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const quizId = req.params.quizId as string;

    const result = createQuestionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const question = await questionService.createQuestion(
      req.user.userId,
      req.user.role,
      quizId,
      result.data
    );

    return res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create question";

    if (
      message === "Quiz not found" ||
      message === "You do not have access to this quiz"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have permission to create questions"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Create question error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const quizId = req.params.quizId as string;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const questions = await questionService.getQuizQuestions(
      req.user.userId,
      req.user.role,
      quizId
    );

    return res.status(200).json({
      questions,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get questions";

    if (
      message === "Quiz not found" ||
      message === "This quiz is not available"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not enrolled in this course" ||
      message === "You do not have access to this quiz" ||
      message === "You do not have permission to view questions"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Get questions error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getOne(req: AuthenticatedRequest, res: Response) {
  try {
    const questionId = req.params.id as string;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const question = await questionService.getQuestionById(
      req.user.userId,
      req.user.role,
      questionId
    );

    return res.status(200).json({
      question,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get question";

    if (message === "Question not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "This question is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(403).json({ message });
    }

    if (
      message === "You do not have access to this question" ||
      message === "You do not have permission to view this question"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Get question error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const questionId = req.params.id as string;

    const result = updateQuestionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const question = await questionService.updateQuestion(
      req.user.userId,
      req.user.role,
      questionId,
      result.data
    );

    return res.status(200).json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update question";

    if (message === "Question not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have access to this question" ||
      message === "You do not have permission to update questions"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Update question error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const questionId = req.params.id as string;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await questionService.deleteQuestion(
      req.user.userId,
      req.user.role,
      questionId
    );

    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete question";

    if (message === "Question not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have access to this question" ||
      message === "You do not have permission to delete questions"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Delete question error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}