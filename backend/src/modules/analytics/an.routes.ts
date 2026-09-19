import { Router } from "express";

import {
  getStudentAnalyticsController,
  getTeacherAnalyticsController,
} from "./an.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

// Student → My achievements / analytics for a course
router.get(
  "/student/:courseId",
  authenticate,
  authorize("student"),
  getStudentAnalyticsController,
);

// Teacher → All student analytics
router.get(
  "/teacher",
  authenticate,
  authorize("instructor"),
  getTeacherAnalyticsController,
);

export default router;