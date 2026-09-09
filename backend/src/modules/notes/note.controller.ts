import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createNoteSchema,
  updateNoteSchema,
} from "./note.validation";

import {
  createNote,
  getLectureNotes,
  updateNote,
  deleteNote,
} from "./note.service";

export const create = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lectureId = String(req.params.lectureId);

    const data = createNoteSchema.parse(req.body);

    const note = await createNote(
      lectureId,
      req.user.userId,
      data,
    );

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (
        error.message === "Lecture not found" ||
        error.message ===
          "You are not enrolled in this course"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
    }

    console.error("Create note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const lectureId = String(req.params.lectureId);

    const notes = await getLectureNotes(
      lectureId,
      req.user.userId,
    );

    return res.status(200).json({
      notes,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Lecture not found" ||
        error.message ===
          "You are not enrolled in this course"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
    }

    console.error("Get notes error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const noteId = String(req.params.id);

    const data = updateNoteSchema.parse(req.body);

    const note = await updateNote(
      noteId,
      req.user.userId,
      data,
    );

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error) {
      if (error.message === "Note not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to update this note"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Update note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const noteId = String(req.params.id);

    await deleteNote(
      noteId,
      req.user.userId,
    );

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Note not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "You do not have permission to delete this note"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    console.error("Delete note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};