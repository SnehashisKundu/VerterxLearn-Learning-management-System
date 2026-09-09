import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import * as questionController from "./qq.controller";

const router = Router();

// Create question
router.post(
  "/quizzes/:quizId/questions",
  authenticate,
  authorize("instructor", "admin"),
  questionController.create
);

// Get all questions
router.get(
  "/quizzes/:quizId/questions",
  authenticate,
  authorize("student", "instructor", "admin"),
  questionController.getAll
);

// Get single question
router.get(
  "/quiz-questions/:id",
  authenticate,
  authorize("student", "instructor", "admin"),
  questionController.getOne
);

// Update question
router.patch(
  "/quiz-questions/:id",
  authenticate,
  authorize("instructor", "admin"),
  questionController.update
);

// Delete question
router.delete(
  "/quiz-questions/:id",
  authenticate,
  authorize("instructor", "admin"),
  questionController.remove
);

export default router;