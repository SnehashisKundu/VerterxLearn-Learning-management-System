import { Router } from "express";

import {
  create,
  getAll,
  getActive,
  getById,
  update,
  remove,
  redeem,
  myRedemptions,
} from "./rw.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

/*
 * Student
 */

// Active rewards - sorted by points low to high
router.get(
  "/",
  authenticate,
  authorize("student"),
  getActive,
);

// Student's own redemption history
router.get(
  "/me/redemptions",
  authenticate,
  authorize("student"),
  myRedemptions,
);

// Redeem a reward
router.post(
  "/:rewardId/redeem",
  authenticate,
  authorize("student"),
  redeem,
);

/*
 * Admin
 */

// All rewards including inactive
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAll,
);

// Create reward
router.post(
  "/",
  authenticate,
  authorize("admin"),
  create,
);

// Get single reward
router.get(
  "/:rewardId",
  authenticate,
  authorize("admin"),
  getById,
);

// Update reward
router.patch(
  "/:rewardId",
  authenticate,
  authorize("admin"),
  update,
);

// Deactivate reward
router.delete(
  "/:rewardId",
  authenticate,
  authorize("admin"),
  remove,
);

export default router;