import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./dc.controller";

const router = Router();

router.post(
  "/courses/:courseId/document-chunks",
  authenticate,
  authorize("instructor", "admin"),
  create
);

router.get(
  "/courses/:courseId/document-chunks",
  authenticate,
  authorize("student", "instructor", "admin"),
  getAll
);

router.get(
  "/document-chunks/:id",
  authenticate,
  authorize("student", "instructor", "admin"),
  getOne
);

router.patch(
  "/document-chunks/:id",
  authenticate,
  authorize("instructor", "admin"),
  update
);

router.delete(
  "/document-chunks/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove
);

export default router;