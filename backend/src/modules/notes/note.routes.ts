import { Router } from "express";

import {
  create,
  getAll,
  update,
  remove,
} from "./note.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/lectures/:lectureId/notes",
  authenticate,
  authorize("student"),
  create,
);

router.get(
  "/lectures/:lectureId/notes",
  authenticate,
  authorize("student"),
  getAll,
);

router.patch(
  "/notes/:id",
  authenticate,
  authorize("student"),
  update,
);

router.delete(
  "/notes/:id",
  authenticate,
  authorize("student"),
  remove,
);

export default router;