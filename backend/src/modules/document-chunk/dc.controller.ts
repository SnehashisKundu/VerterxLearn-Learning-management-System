import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  createDocumentChunk,
  getCourseDocumentChunks,
  getDocumentChunkById,
  updateDocumentChunk,
  deleteDocumentChunk,
} from "./dc.service";
import {
  createDocumentChunkSchema,
  updateDocumentChunkSchema,
} from "./dc.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    const data = createDocumentChunkSchema.parse(req.body);

    const chunk = await createDocumentChunk(
      authReq.user!.userId,
      authReq.user!.role,
      req.params.courseId as string,
      data
    );

    return res.status(201).json({
      message: "Document chunk created successfully",
      chunk,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Course not found" ||
      message === "Lecture not found"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this document chunk" ||
      message === "Lecture does not belong to this course"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    const chunks = await getCourseDocumentChunks(
      authReq.user!.userId,
      authReq.user!.role,
      req.params.courseId as string
    );

    return res.status(200).json({
      message: "Document chunks fetched successfully",
      chunks,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Course not found" ||
      message === "Course is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this document chunk"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    const chunk = await getDocumentChunkById(
      authReq.user!.userId,
      authReq.user!.role,
      req.params.id as string
    );

    return res.status(200).json({
      message: "Document chunk fetched successfully",
      chunk,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Document chunk not found" ||
      message === "Course is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this document chunk"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    const data = updateDocumentChunkSchema.parse(req.body);

    const chunk = await updateDocumentChunk(
      authReq.user!.userId,
      authReq.user!.role,
      req.params.id as string,
      data
    );

    return res.status(200).json({
      message: "Document chunk updated successfully",
      chunk,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "Document chunk not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this document chunk"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    await deleteDocumentChunk(
      authReq.user!.userId,
      authReq.user!.role,
      req.params.id as string
    );

    return res.status(200).json({
      message: "Document chunk deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "Document chunk not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "You are not allowed to manage this document chunk"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};