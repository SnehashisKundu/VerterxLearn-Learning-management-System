import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createLectureProgressSchema,
  updateLectureProgressSchema,
} from "./lp.validation";

import {
  createLectureProgress,
  getLectureProgress,
  updateLectureProgress,
} from "./lp.service";

export const create = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lectureId = String(req.params.lectureId);

    const data = createLectureProgressSchema.parse(
      req.body,
    );

    const progress = await createLectureProgress(
      lectureId,
      req.user.userId,
      data,
    );

    return res.status(201).json({
      message: "Lecture progress created successfully",
      progress,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (
        error.message === "Lecture not found" ||
        error.message ===
          "You are not enrolled in this course"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "Lecture progress already exists"
      ) {
        return res.status(409).json({
          message: error.message,
        });
      }
    }

    console.error(
      "Create lecture progress error:",
      error,
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const get = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lectureId = String(req.params.lectureId);

    const progress = await getLectureProgress(
      lectureId,
      req.user.userId,
    );

    return res.status(200).json({
      progress,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Lecture not found" ||
        error.message ===
          "You are not enrolled in this course" ||
        error.message === "Lecture progress not found"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
    }

    console.error(
      "Get lecture progress error:",
      error,
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lectureId = String(req.params.lectureId);

    const data = updateLectureProgressSchema.parse(
      req.body,
    );

    const progress = await updateLectureProgress(
      lectureId,
      req.user.userId,
      data,
    );

    return res.status(200).json({
      message: "Lecture progress updated successfully",
      progress,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (
        error.message === "Lecture not found" ||
        error.message ===
          "You are not enrolled in this course" ||
        error.message === "Lecture progress not found"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
    }

    console.error(
      "Update lecture progress error:",
      error,
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};