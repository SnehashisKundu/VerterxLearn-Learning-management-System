import { Router } from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./fc.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

// Get all flashcards of a module
router.get(
  "/modules/:moduleId/flashcards",
  authenticate,
  getAll,
);

// Create flashcard inside a module
router.post(
  "/modules/:moduleId/flashcards",
  authenticate,
  authorize("instructor", "admin"),
  create,
);

// Get single flashcard
router.get(
  "/flashcards/:id",
  authenticate,
  getById,
);

// Update flashcard
router.patch(
  "/flashcards/:id",
  authenticate,
  authorize("instructor", "admin"),
  update,
);

// Delete flashcard
router.delete(
  "/flashcards/:id",
  authenticate,
  authorize("instructor", "admin"),
  remove,
);

export default router;