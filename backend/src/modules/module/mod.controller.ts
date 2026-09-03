import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createModuleSchema,
  updateModuleSchema,
} from "./mod.validation";

import {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
} from "./mod.service";

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

    const result = createModuleSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const module = await createModule(
      String(req.params.courseId),
      req.user.userId,
      req.user.role,
      result.data
    );

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    console.error("Create module error:", error);

    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this course"
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

    const modules = await getModulesByCourse(
      String(req.params.courseId),
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Modules fetched successfully",
      data: modules,
    });
  } catch (error) {
    console.error("Get modules error:", error);

    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this course"
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

    const module = await getModuleById(
      String(req.params.id),
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Module fetched successfully",
      data: module,
    });
  } catch (error) {
    console.error("Get module error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Module not found" ||
        error.message === "Course not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this module"
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

    const result = updateModuleSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const module = await updateModule(
      String(req.params.id),
      req.user.userId,
      req.user.role,
      result.data
    );

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    console.error("Update module error:", error);

    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to update this module"
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

    await deleteModule(
      String(req.params.id),
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Delete module error:", error);

    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to delete this module"
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