import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  adjustPointsSchema,
  earnPointsSchema,
  userIdParamSchema,
} from "./pw.validation";

import {
  adjustPoints,
  earnPoints,
  getTransactions,
  getWallet,
} from "./pw.service";

export const getMyWallet = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.userId;

  const wallet = await getWallet(userId);

  return res.status(200).json({
    success: true,
    message: "Point wallet fetched successfully",
    data: wallet,
  });
};

export const getMyTransactions = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.userId;

  const transactions = await getTransactions(userId);

  return res.status(200).json({
    success: true,
    message: "Point transactions fetched successfully",
    data: transactions,
  });
};

export const earn = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = earnPointsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request",
    });
  }

  const userId = req.user!.userId;

  const result = await earnPoints(
    userId,
    parsed.data.amount,
    parsed.data.reason,
    parsed.data.referenceId,
  );

  return res.status(200).json({
    success: true,
    message: "Points earned successfully",
    data: result,
  });
};

export const adjust = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsedParams = userIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const parsed = adjustPointsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request",
    });
  }

  try {
    const result = await adjustPoints(
      parsedParams.data.userId,
      parsed.data.amount,
      parsed.data.reason,
      parsed.data.referenceId,
    );

    return res.status(200).json({
      success: true,
      message: "Points adjusted successfully",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient points balance"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }
};