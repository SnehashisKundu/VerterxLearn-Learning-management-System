import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import {
  create,
  getAll,
  activate,
  getActive,
} from "./ct.controller";

const router = Router();

// Create certificate template
router.post(
  "/",
  authenticate,
  authorize("admin"),
  create
);

// Get all certificate templates
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAll
);

// Get active certificate template
router.get(
  "/active",
  authenticate,
  getActive
);

// Activate certificate template
router.patch(
  "/:templateId/activate",
  authenticate,
  authorize("admin"),
  activate
);

export default router;