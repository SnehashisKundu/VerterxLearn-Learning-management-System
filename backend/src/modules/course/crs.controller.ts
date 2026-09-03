import type { Response } from "express";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createCourseSchema,
  updateCourseSchema,
} from "./crs.validation";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "./crs.service";

export const create = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = createCourseSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const course = await createCourse(
      req.user.userId,
      result.data
    );

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courses = await getCourses(req.user.role);

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const course = await getCourseById(
      req.params.id as string,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    if (
      error instanceof Error &&
      error.message === "Course not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = updateCourseSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const course = await updateCourse(
      req.params.id as string,
      req.user.userId,
      req.user.role,
      result.data
    );

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Update course error:", error);

    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to update this course"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await deleteCourse(
      req.params.id as string,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to delete this course"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};