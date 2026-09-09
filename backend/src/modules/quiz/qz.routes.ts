import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./qz.controller";

const router = Router();

router.post(
  "/modules/:moduleId/quizzes",
  authenticate,
  authorize("instructor", "admin"),
  create
);

router.get(
  "/modules/:moduleId/quizzes",
  authenticate,
  authorize("student", "instructor", "admin"),
  getAll
);

router.get(
  "/quizzes/:id",
  authenticate,
  authorize("student", "instructor", "admin"),
  getOne
);

router.patch(
  "/quizzes/:id",
  authenticate,
  authorize("instructor", "admin"),
  update
);

router.delete(
  "/quizzes/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove
);

export default router;