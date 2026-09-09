import type { Request, Response } from "express";
import { z } from "zod";

import * as attendanceService from "./attnd.service";
import {
  createAttendanceSessionSchema,
  scanAttendanceSchema,
} from "./attnd.validation";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
  };
};

export async function createSession(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const parsed =
      createAttendanceSessionSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: z.flattenError(parsed.error),
      });
    }

    const session =
      await attendanceService.createAttendanceSession(
        req.user.userId,
        parsed.data.courseId
      );

    return res.status(201).json({
      message:
        "Attendance session created successfully",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create attendance session";

    if (
      message === "Instructor not found" ||
      message === "Course not found"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
        "Only instructors can create attendance sessions" ||
      message ===
        "You are not the instructor of this course"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message ===
      "An active attendance session already exists"
    ) {
      return res.status(409).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function scan(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const parsed =
      scanAttendanceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: z.flattenError(parsed.error),
      });
    }

    const attendance =
      await attendanceService.scanAttendance(
        req.user.userId,
        parsed.data.sessionId,
        parsed.data.qrToken
      );

    return res.status(201).json({
      message:
        "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to mark attendance";

    if (
      message === "Instructor not found" ||
      message ===
        "Attendance session not found" ||
      message === "Student not found"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
        "Only instructors can scan attendance" ||
      message ===
        "You are not authorized for this attendance session" ||
      message ===
        "QR does not belong to a student" ||
      message ===
        "Student is not enrolled in this course"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message === "Invalid QR token"
    ) {
      return res.status(400).json({
        message,
      });
    }

    if (
      message === "Attendance session is closed" ||
      message === "Attendance already marked"
    ) {
      return res.status(409).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function closeSession(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const sessionId = req.params.sessionId;

    if (!sessionId || Array.isArray(sessionId)) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const session =
      await attendanceService.closeAttendanceSession(
        req.user.userId,
        sessionId
      );

    return res.status(200).json({
      message:
        "Attendance session closed successfully",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to close attendance session";

    if (
      message ===
      "Attendance session not found"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
      "You are not authorized to close this session"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message ===
      "Attendance session is already closed"
    ) {
      return res.status(409).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getSession(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const sessionId = req.params.sessionId;

    if (typeof sessionId !== "string" || !sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const session =
      await attendanceService.getAttendanceSession(
        req.user.userId,
        sessionId
      );

    return res.status(200).json({
      message:
        "Attendance records fetched successfully",
      session,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch attendance records";

    if (
      message ===
      "Attendance session not found"
    ) {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
      "You are not authorized to view this attendance session"
    ) {
      return res.status(403).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMyAttendance(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attendance =
      await attendanceService.getMyAttendance(
        req.user.userId
      );

    return res.status(200).json({
      message:
        "Attendance history fetched successfully",
      attendance,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch attendance history";

    if (message === "Student not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
      "Only students can view their attendance"
    ) {
      return res.status(403).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}