import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

import { studentAnalyticsSchema } from "./an.validation";
import {
  getStudentAnalytics,
  getInstructorAnalytics,
} from "./an.service";

export const getStudentAnalyticsController = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = studentAnalyticsSchema.safeParse(
    req.params,
  );

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid course ID",
    });
  }

  const analytics = await getStudentAnalytics(
    req.user!.userId,
    parsed.data.courseId,
  );

  return res.status(200).json({
    success: true,
    message: "Student analytics fetched successfully",
    data: analytics,
  });
};

export const getTeacherAnalyticsController = async (
  req: AuthRequest,
  res: Response,
) => {
  const analytics = await getInstructorAnalytics(
    req.user!.userId,
  );

  return res.status(200).json({
    success: true,
    message: "Teacher analytics fetched successfully",
    data: analytics,
  });
};