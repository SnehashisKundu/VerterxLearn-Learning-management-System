import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import * as optionController from "./qo.controller";

const router = Router();

// Create option
router.post(
  "/quiz-questions/:questionId/options",
  authenticate,
  authorize("instructor", "admin"),
  optionController.create
);

// Get all options
router.get(
  "/quiz-questions/:questionId/options",
  authenticate,
  authorize("student", "instructor", "admin"),
  optionController.getAll
);

// Update option
router.patch(
  "/quiz-options/:id",
  authenticate,
  authorize("instructor", "admin"),
  optionController.update
);

// Delete option
router.delete(
  "/quiz-options/:id",
  authenticate,
  authorize("instructor", "admin"),
  optionController.remove
);

export default router;