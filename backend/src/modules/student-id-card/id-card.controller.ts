import type { Request, Response } from "express";

import * as idCardService from "./id-card.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
  };
};

export async function create(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const card =
      await idCardService.createStudentIdCard(
        req.user.userId
      );

    return res.status(201).json({
      message:
        "Student ID card created successfully",
      card,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create student ID card";

    if (message === "Student not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
      "Only students can have an ID card"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message ===
      "Student ID card already exists"
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

export async function getMyCard(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const card =
      await idCardService.getMyStudentIdCard(
        req.user.userId
      );

    return res.status(200).json({
      message:
        "Student ID card fetched successfully",
      card,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch student ID card";

    if (
      message ===
      "Student ID card not found"
    ) {
      return res.status(404).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}