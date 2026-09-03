import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import { createEnrollmentSchema } from "./enr.validation";

import {
  createEnrollment,
  getMyEnrollments,
  getEnrollmentById,
} from "./enr.service";

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

    const data = createEnrollmentSchema.parse(req.body);

    const enrollment = await createEnrollment(
      req.user.userId,
      data,
    );

    return res.status(201).json({
      message: "Course enrolled successfully",
      enrollment,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You can only enroll in published courses"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You are already enrolled in this course"
      ) {
        return res.status(409).json({
          message: error.message,
        });
      }
    }

    console.error("Create enrollment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const enrollments = await getMyEnrollments(
      req.user.userId,
    );

    return res.status(200).json({
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const enrollmentId = String(req.params.id);

    const enrollment = await getEnrollmentById(
      enrollmentId,
      req.user.userId,
    );

    return res.status(200).json({
      enrollment,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Enrollment not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this enrollment"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Get enrollment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};