import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./crs.controller";

const router = Router();

// Anyone authenticated can view courses.
// Students only see published courses.
router.get(
  "/",
  authenticate,
  getAll
);

// Anyone authenticated can view a course.
// Students cannot view unpublished courses.
router.get(
  "/:id",
  authenticate,
  getById
);

// Only instructors and admins can create courses.
router.post(
  "/",
  authenticate,
  authorize("instructor", "admin"),
  create
);

// Only instructors and admins can update courses.
router.patch(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  update
);

// Only instructors and admins can delete courses.
router.delete(
  "/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove
);

export default router;