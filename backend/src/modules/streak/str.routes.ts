import { Router } from "express";

import {
  getStreak,
  activity,
} from "./str.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

// Student's current streak
router.get(
  "/me",
  authenticate,
  authorize("student"),
  getStreak,
);

// Record daily activity
router.post(
  "/activity",
  authenticate,
  authorize("student"),
  activity,
);

export default router;