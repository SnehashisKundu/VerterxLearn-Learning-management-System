import { Request, Response } from "express";
import { ZodError } from "zod";

import {
  createPointRule,
  getAllPointRules,
  getPointRuleByKey,
  updatePointRule,
  deletePointRule,
} from "./point-rule.service";

import {
  createPointRuleSchema,
  updatePointRuleSchema,
  pointRuleKeyParamSchema,
} from "./point-rule.validation";

const getZodMessage = (error: ZodError) => {
  return error.issues
    .map((issue) => issue.message)
    .join(", ");
};

// Create point rule
export const create = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = createPointRuleSchema.parse(req.body);

    const rule = await createPointRule({
      key: data.key,
      name: data.name,
      points: data.points,
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
    });

    return res.status(201).json({
      success: true,
      message: "Point rule created successfully",
      data: rule,
    });
  } catch (error) {
    console.error("Create point rule error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create point rule",
    });
  }
};

// Get all point rules
export const getAll = async (
  _req: Request,
  res: Response,
) => {
  try {
    const rules = await getAllPointRules();

    return res.status(200).json({
      success: true,
      message: "Point rules fetched successfully",
      data: rules,
    });
  } catch (error) {
    console.error("Get point rules error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch point rules",
    });
  }
};

// Get point rule by key
export const getByKey = async (
  req: Request,
  res: Response,
) => {
  try {
    const { key } = pointRuleKeyParamSchema.parse(
      req.params,
    );

    const rule = await getPointRuleByKey(key);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Point rule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Point rule fetched successfully",
      data: rule,
    });
  } catch (error) {
    console.error("Get point rule error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch point rule",
    });
  }
};

// Update point rule
export const update = async (
  req: Request,
  res: Response,
) => {
  try {
    const { key } = pointRuleKeyParamSchema.parse(
      req.params,
    );

    const data = updatePointRuleSchema.parse(req.body);

    const rule = await updatePointRule(key, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.points !== undefined ? { points: data.points } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    });

    return res.status(200).json({
      success: true,
      message: "Point rule updated successfully",
      data: rule,
    });
  } catch (error) {
    console.error("Update point rule error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update point rule",
    });
  }
};

// Delete point rule
export const remove = async (
  req: Request,
  res: Response,
) => {
  try {
    const { key } = pointRuleKeyParamSchema.parse(
      req.params,
    );

    await deletePointRule(key);

    return res.status(200).json({
      success: true,
      message: "Point rule deleted successfully",
    });
  } catch (error) {
    console.error("Delete point rule error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete point rule",
    });
  }
};