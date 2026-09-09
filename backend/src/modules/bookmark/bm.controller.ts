import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  createBookmark,
  getLectureBookmarks,
  deleteBookmark,
} from "./bm.service";
import { createBookmarkSchema } from "./bm.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = createBookmarkSchema.parse(req.body);

    const bookmark = await createBookmark(
      authReq.user.userId,
      req.params.lectureId as string,
      data
    );

    return res.status(201).json({
      message: "Bookmark created successfully",
      bookmark,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Lecture not found" ||
      message === "Lecture is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
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

    const bookmarks = await getLectureBookmarks(
      authReq.user.userId,
      req.params.lectureId as string
    );

    return res.status(200).json({
      message: "Bookmarks fetched successfully",
      bookmarks,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Lecture not found" ||
      message === "Lecture is not available" ||
      message === "You are not enrolled in this course"
    ) {
      return res.status(404).json({ message });
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

    await deleteBookmark(authReq.user.userId, req.params.id as string);

    return res.status(200).json({
      message: "Bookmark deleted successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Bookmark not found") {
      return res.status(404).json({ message });
    }

    if (message === "You are not allowed to delete this bookmark") {
      return res.status(403).json({ message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};