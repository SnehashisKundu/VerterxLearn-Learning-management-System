import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createBadgeSchema,
  updateBadgeSchema,
  awardBadgeSchema,
} from "./badge.validation";

import {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  getUserBadges,
  awardBadge,
} from "./badge.service";

export const create = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = createBadgeSchema.parse(req.body);

    const badge = await createBadge(data);

    return res.status(201).json({
      success: true,
      message: "Badge created successfully",
      data: badge,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Badge already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create badge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAll = async (
  _req: AuthRequest,
  res: Response,
) => {
  try {
    const badges = await getAllBadges();

    return res.status(200).json({
      success: true,
      message: "Badges fetched successfully",
      data: badges,
    });
  } catch (error) {
    console.error("Get badges error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const badgeId = Number(req.params.badgeId);

    if (!Number.isInteger(badgeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid badge ID",
      });
    }

    const badge = await getBadgeById(badgeId);

    return res.status(200).json({
      success: true,
      message: "Badge fetched successfully",
      data: badge,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Badge not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get badge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const badgeId = Number(req.params.badgeId);

    if (!Number.isInteger(badgeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid badge ID",
      });
    }

    const data = updateBadgeSchema.parse(req.body);

    const badge = await updateBadge(badgeId, data);

    return res.status(200).json({
      success: true,
      message: "Badge updated successfully",
      data: badge,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (error.message === "Badge not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Badge already exists") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Update badge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const badgeId = Number(req.params.badgeId);

    if (!Number.isInteger(badgeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid badge ID",
      });
    }

    await deleteBadge(badgeId);

    return res.status(200).json({
      success: true,
      message: "Badge deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Badge not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete badge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMine = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const badges = await getUserBadges(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "User badges fetched successfully",
      data: badges,
    });
  } catch (error) {
    console.error("Get user badges error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const award = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = String(req.params.userId);
    const badgeId = Number(req.params.badgeId);
    const { moduleId } = awardBadgeSchema.parse(req.body);

    if (!Number.isInteger(badgeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid badge ID",
      });
    }

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required",
      });
    }

    const userBadge = await awardBadge(
      userId,
      badgeId,
      moduleId,
    );

    return res.status(201).json({
      success: true,
      message: "Badge awarded successfully",
      data: userBadge,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Badge not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Module not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "Complete all lectures in the module before earning this badge"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "Module has no lectures"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Badge already awarded") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Award badge error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};