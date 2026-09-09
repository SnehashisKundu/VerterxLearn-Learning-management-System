import type { Request, Response } from "express";
import {
  createOptionSchema,
  updateOptionSchema,
} from "./qo.validation";
import * as optionService from "./qo.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: any;
  };
};

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const questionId = req.params.questionId as string;

    const result = createOptionSchema.safeParse(req.body);

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

    const option = await optionService.createOption(
      req.user.userId,
      req.user.role,
      questionId,
      result.data
    );

    return res.status(201).json({
      message: "Option created successfully",
      option,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create option";

    if (message === "Question not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have access to this question" ||
      message === "You do not have permission to create options"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Create option error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const questionId = req.params.questionId as string;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const options = await optionService.getQuestionOptions(
      req.user.userId,
      req.user.role,
      questionId
    );

    return res.status(200).json({
      options,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get options";

    if (
      message === "Question not found" ||
      message === "This question is not available"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not enrolled in this course" ||
      message === "You do not have access to this question" ||
      message === "You do not have permission to view options"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Get options error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const optionId = req.params.id as string;

    const result = updateOptionSchema.safeParse(req.body);

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

    const option = await optionService.updateOption(
      req.user.userId,
      req.user.role,
      optionId,
      result.data
    );

    return res.status(200).json({
      message: "Option updated successfully",
      option,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update option";

    if (message === "Option not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have access to this question" ||
      message === "You do not have permission to update options"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Update option error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const optionId = req.params.id as string;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await optionService.deleteOption(
      req.user.userId,
      req.user.role,
      optionId
    );

    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete option";

    if (message === "Option not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You do not have access to this question" ||
      message === "You do not have permission to delete options"
    ) {
      return res.status(403).json({ message });
    }

    console.error("Delete option error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}