import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { create, getAll, remove } from "./lr.controller";

const router = Router();

router.post(
  "/lectures/:lectureId/resources",
  authenticate,
  authorize("instructor", "admin"),
  create
);

router.get(
  "/lectures/:lectureId/resources",
  authenticate,
  authorize("student", "instructor", "admin"),
  getAll
);

router.delete(
  "/resources/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove
);

export default router;