import { Router } from "express";

import {
  create,
  get,
  update,
} from "./lp.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/lectures/:lectureId/progress",
  authenticate,
  authorize("student"),
  create,
);

router.get(
  "/lectures/:lectureId/progress",
  authenticate,
  authorize("student"),
  get,
);

router.patch(
  "/lectures/:lectureId/progress",
  authenticate,
  authorize("student"),
  update,
);

export default router;