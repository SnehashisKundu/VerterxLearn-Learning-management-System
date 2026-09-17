import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";
import { getLearningRoadmap } from "./rd.service";
import { roadmapParamsSchema } from "./rd.validation";

export const getRoadmap = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { courseId } = roadmapParamsSchema.parse(
      req.params,
    );

    const result = await getLearningRoadmap(
      courseId,
      req.user.userId,
    );

    return res.status(200).json({
      success: true,
      message: "Learning roadmap fetched successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (
      error instanceof Error &&
      error.message === "You are not enrolled in this course"
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Course not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error("Learning roadmap error:", error);

    return res.status(503).json({
      message: "Learning roadmap service unavailable",
    });
  }
};