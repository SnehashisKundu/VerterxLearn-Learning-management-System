import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import * as attendanceController from "./attnd.controller";

const router = Router();

router.post(
  "/sessions",
  authenticate,
  authorize("instructor"),
  attendanceController.createSession
);

router.post(
  "/scan",
  authenticate,
  authorize("instructor"),
  attendanceController.scan
);

router.patch(
  "/sessions/:sessionId/close",
  authenticate,
  authorize("instructor"),
  attendanceController.closeSession
);

router.get(
  "/sessions/:sessionId",
  authenticate,
  authorize("instructor"),
  attendanceController.getSession
);

router.get(
  "/my",
  authenticate,
  authorize("student"),
  attendanceController.getMyAttendance
);

export default router;