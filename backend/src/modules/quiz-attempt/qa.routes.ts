import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import * as attemptController from "./qa.controller";

const router = Router();

// Start quiz attempt
router.post(
  "/quizzes/:quizId/attempts",
  authenticate,
  authorize("student"),
  attemptController.create
);

// Get quiz attempts
router.get(
  "/quizzes/:quizId/attempts",
  authenticate,
  authorize("student", "instructor", "admin"),
  attemptController.getAll
);

// Get single attempt
router.get(
  "/quiz-attempts/:id",
  authenticate,
  authorize("student", "instructor", "admin"),
  attemptController.getOne
);

export default router;