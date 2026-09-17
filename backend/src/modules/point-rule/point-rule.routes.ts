import { Router } from "express";

import {
  create,
  getAll,
  getByKey,
  update,
  remove,
} from "./point-rule.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

/*
 * Point Rule Management
 *
 * Admin only
 */

// Create point rule
router.post(
  "/",
  authenticate,
  authorize("admin"),
  create,
);

// Get all point rules
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAll,
);

// Get point rule by key
router.get(
  "/:key",
  authenticate,
  authorize("admin"),
  getByKey,
);

// Update point rule
router.patch(
  "/:key",
  authenticate,
  authorize("admin"),
  update,
);

// Delete point rule
router.delete(
  "/:key",
  authenticate,
  authorize("admin"),
  remove,
);

export default router;