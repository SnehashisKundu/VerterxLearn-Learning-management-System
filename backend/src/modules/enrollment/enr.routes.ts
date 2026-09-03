import { Router } from "express";

import {
  create,
  getAll,
  getById,
} from "./enr.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/enrollments",
  authenticate,
  authorize("student"),
  create,
);

router.get(
  "/enrollments",
  authenticate,
  authorize("student"),
  getAll,
);

router.get(
  "/enrollments/:id",
  authenticate,
  authorize("student"),
  getById,
);

export default router;