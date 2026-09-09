import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import * as answerController from "./qans.controller";

const router = Router();

router.post(
  "/quiz-attempts/:attemptId/answers",
  authenticate,
  authorize("student"),
  answerController.create
);

router.get(
  "/quiz-attempts/:attemptId/answers",
  authenticate,
  authorize(
    "student",
    "instructor",
    "admin"
  ),
  answerController.getAll
);

router.post(
  "/quiz-attempts/:attemptId/submit",
  authenticate,
  authorize("student"),
  answerController.submit
);

export default router;