import type { Request, Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  createLectureSchema,
  updateLectureSchema,
} from "./lec.validation";
import {
  createLecture,
  getLecturesByModule,
  getLectureById,
  updateLecture,
  deleteLecture,
} from "./lec.service";

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

    const moduleId = String(req.params.moduleId);

    const data = createLectureSchema.parse(req.body);

    const lecture = await createLecture(
      moduleId,
      req.user.userId,
      req.user.role,
      data,
    );

    return res.status(201).json({
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this module"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Create lecture error:", error);

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

    const moduleId = String(req.params.moduleId);

    const lectures = await getLecturesByModule(
      moduleId,
      req.user.userId,
      req.user.role,
    );

    return res.status(200).json({
      lectures,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this module"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Get lectures error:", error);

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

    const lectureId = String(req.params.id);

    const lecture = await getLectureById(
      lectureId,
      req.user.userId,
      req.user.role,
    );

    return res.status(200).json({
      lecture,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Lecture not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this lecture"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Get lecture error:", error);

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

    const lectureId = String(req.params.id);

    const data = updateLectureSchema.parse(req.body);

    const lecture = await updateLecture(
      lectureId,
      req.user.userId,
      req.user.role,
      data,
    );

    return res.status(200).json({
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (error.message === "Lecture not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to update this lecture"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Update lecture error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lectureId = String(req.params.id);

    await deleteLecture(
      lectureId,
      req.user.userId,
      req.user.role,
    );

    return res.status(200).json({
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Lecture not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to delete this lecture"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Delete lecture error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};