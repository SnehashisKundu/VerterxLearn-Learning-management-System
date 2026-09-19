import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

import { activitySchema } from "./str.validation";
import {
  getMyStreak,
  recordActivity,
} from "./str.service";

export const getStreak = async (
  req: AuthRequest,
  res: Response,
) => {
  const streak = await getMyStreak(req.user!.userId);

  return res.status(200).json({
    success: true,
    message: "Streak fetched successfully",
    data: streak ?? {
      userId: req.user!.userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveAt: null,
    },
  });
};

export const activity = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = activitySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid request",
    });
  }

  const streak = await recordActivity(
    req.user!.userId,
    parsed.data.activityDate,
  );

  return res.status(200).json({
    success: true,
    message: "Streak activity recorded successfully",
    data: streak,
  });
};