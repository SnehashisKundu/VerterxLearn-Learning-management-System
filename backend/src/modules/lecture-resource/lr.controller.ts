import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  createLectureResource,
  getLectureResources,
  deleteLectureResource,
} from "./lr.service";
import { createLectureResourceSchema } from "./lr.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = createLectureResourceSchema.parse(req.body);

    const resource = await createLectureResource(
      authReq.user.userId,
      authReq.user.role,
      req.params.lectureId as string,
      data
    );

    return res.status(201).json({
      message: "Lecture resource created successfully",
      resource,
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
      message === "Lecture not found" ||
      message === "Lecture is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
    }

    if (message === "You are not allowed to manage this resource") {
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

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resources = await getLectureResources(
      authReq.user.userId,
      authReq.user.role,
      req.params.lectureId as string
    );

    return res.status(200).json({
      message: "Lecture resources fetched successfully",
      resources,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Lecture not found" ||
      message === "Lecture is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
    }

    if (message === "You are not allowed to manage this resource") {
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

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await deleteLectureResource(
      authReq.user.userId,
      authReq.user.role,
      req.params.id as string
    );

    return res.status(200).json({
      message: "Lecture resource deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message === "Resource not found") {
      return res.status(404).json({ message });
    }

    if (
      message === "Students cannot delete resources" ||
      message === "You are not allowed to manage this resource"
    ) {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};