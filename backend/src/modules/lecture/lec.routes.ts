import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./lec.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.get(
  "/modules/:moduleId/lectures",
  authenticate,
  getAll,
);

router.post(
  "/modules/:moduleId/lectures",
  authenticate,
  authorize("instructor", "admin"),
  create,
);

router.get(
  "/lectures/:id",
  authenticate,
  getById,
);

router.patch(
  "/lectures/:id",
  authenticate,
  authorize("instructor", "admin"),
  update,
);

router.delete(
  "/lectures/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove,
);

export default router;