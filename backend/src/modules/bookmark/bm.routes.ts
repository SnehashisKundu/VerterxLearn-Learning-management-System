import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { create, getAll, remove } from "./bm.controller";

const router = Router();

router.post(
  "/lectures/:lectureId/bookmarks",
  authenticate,
  authorize("student"),
  create
);

router.get(
  "/lectures/:lectureId/bookmarks",
  authenticate,
  authorize("student"),
  getAll
);

router.delete(
  "/bookmarks/:id",
  authenticate,
  authorize("student"),
  remove
);

export default router;