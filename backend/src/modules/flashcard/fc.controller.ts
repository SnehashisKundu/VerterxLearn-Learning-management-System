import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createFlashcardSchema,
  updateFlashcardSchema,
} from "./fc.validation";

import {
  createFlashcard,
  getFlashcardsByModule,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
} from "./fc.service";

// --------------------------------------------------
// Create
// --------------------------------------------------

export const create = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = createFlashcardSchema.safeParse(
      req.body,
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const flashcard = await createFlashcard(
      String(req.params.moduleId),
      req.user.userId,
      req.user.role,
      result.data,
    );

    return res.status(201).json({
      success: true,
      message: "Flashcard created successfully",
      data: flashcard,
    });
  } catch (error) {
    console.error("Create flashcard error:", error);

    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this module"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// Get All By Module
// --------------------------------------------------

export const getAll = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const flashcards = await getFlashcardsByModule(
      String(req.params.moduleId),
      req.user.userId,
      req.user.role,
    );

    return res.status(200).json({
      success: true,
      message: "Flashcards fetched successfully",
      data: flashcards,
    });
  } catch (error) {
    console.error("Get flashcards error:", error);

    if (error instanceof Error) {
      if (error.message === "Module not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this module"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// Get One
// --------------------------------------------------

export const getById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const flashcard = await getFlashcardById(
      String(req.params.id),
      req.user.userId,
      req.user.role,
    );

    return res.status(200).json({
      success: true,
      message: "Flashcard fetched successfully",
      data: flashcard,
    });
  } catch (error) {
    console.error("Get flashcard error:", error);

    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to access this flashcard"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// Update
// --------------------------------------------------

export const update = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = updateFlashcardSchema.safeParse(
      req.body,
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const flashcard = await updateFlashcard(
      String(req.params.id),
      req.user.userId,
      req.user.role,
      result.data,
    );

    return res.status(200).json({
      success: true,
      message: "Flashcard updated successfully",
      data: flashcard,
    });
  } catch (error) {
    console.error("Update flashcard error:", error);

    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to update this flashcard"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// --------------------------------------------------
// Delete
// --------------------------------------------------

export const remove = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await deleteFlashcard(
      String(req.params.id),
      req.user.userId,
      req.user.role,
    );

    return res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (error) {
    console.error("Delete flashcard error:", error);

    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to delete this flashcard"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};