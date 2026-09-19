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
  adminRedemptions,
  updateRedemption,
} from "./rw.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

/*
 * STUDENT
 */

// Active rewards
router.get(
  "/",
  authenticate,
  authorize("student"),
  getActive,
);

// My redemption history
router.get(
  "/me/redemptions",
  authenticate,
  authorize("student"),
  myRedemptions,
);

// Redeem reward
router.post(
  "/:rewardId/redeem",
  authenticate,
  authorize("student"),
  redeem,
);

/*
 * ADMIN
 */

// All redemption requests
router.get(
  "/admin/redemptions",
  authenticate,
  authorize("admin"),
  adminRedemptions,
);

// Update redemption status
router.patch(
  "/admin/redemptions/:redemptionId/status",
  authenticate,
  authorize("admin"),
  updateRedemption,
);

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