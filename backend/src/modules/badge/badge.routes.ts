import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
  getMine,
  award,
} from "./badge.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

/*
 * Student
 */

// Get badges earned by logged-in student
router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMine,
);

/*
 * Badge management
 */

// Create badge
router.post(
  "/",
  authenticate,
  authorize("admin"),
  create,
);

// Get all badges
router.get(
  "/",
  authenticate,
  getAll,
);

// Get badge by ID
router.get(
  "/:badgeId",
  authenticate,
  getById,
);

// Update badge
router.patch(
  "/:badgeId",
  authenticate,
  authorize("admin"),
  update,
);

// Delete badge
router.delete(
  "/:badgeId",
  authenticate,
  authorize("admin"),
  remove,
);

/*
 * Award badge
 */

router.post(
  "/:badgeId/users/:userId",
  authenticate,
  authorize("admin"),
  award,
);

export default router;