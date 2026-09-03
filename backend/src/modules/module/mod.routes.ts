import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./mod.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

// Get all modules of a course
router.get(
  "/courses/:courseId/modules",
  authenticate,
  getAll
);

// Create module inside a course
router.post(
  "/courses/:courseId/modules",
  authenticate,
  authorize("instructor", "admin"),
  create
);

// Get single module
router.get(
  "/modules/:id",
  authenticate,
  getById
);

// Update module
router.patch(
  "/modules/:id",
  authenticate,
  authorize("instructor", "admin"),
  update
);

// Delete module
router.delete(
  "/modules/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove
);

export default router;