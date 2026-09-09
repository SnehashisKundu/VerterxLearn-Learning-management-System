import type { Request, Response } from "express";

import {
  createAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
} from "./asgn.validation";

import * as assignmentService from "./asgn.service";

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

    const result =
      createAssignmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const assignment =
      await assignmentService.createAssignment(
        req.user.userId,
        result.data
      );

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create assignment";

    if (message === "Course not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes(
        "do not have permission"
      )
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message ===
      "Due date must be in the future"
    ) {
      return res.status(400).json({
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function submit(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const assignmentId =
      req.params.id as string;

    const result =
      submitAssignmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const submission =
      await assignmentService.submitAssignment(
        req.user.userId,
        assignmentId,
        result.data
      );

    return res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit assignment";

    if (message === "Assignment not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
      "You are not enrolled in this course"
    ) {
      return res.status(403).json({
        message,
      });
    }

    if (
      message ===
      "Assignment submission deadline has passed"
    ) {
      return res.status(409).json({
        message,
      });
    }

    if (
      message ===
      "You have already submitted this assignment"
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

export async function grade(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const submissionId =
      req.params.id as string;

    const result =
      gradeSubmissionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const submission =
      await assignmentService.gradeSubmission(
        req.user.userId,
        submissionId,
        result.data
      );

    return res.status(200).json({
      message: "Assignment graded successfully",
      submission,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to grade submission";

    if (message === "Submission not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes(
        "do not have permission"
      )
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

export async function getAssignment(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const assignmentId =
      req.params.id as string;

    const assignment =
      await assignmentService.getAssignment(
        req.user.userId,
        assignmentId
      );

    return res.status(200).json({
      message: "Assignment fetched successfully",
      assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch assignment";

    if (message === "Assignment not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message ===
      "You are not enrolled in this course"
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

export async function getSubmissions(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const assignmentId =
      req.params.id as string;

    const submissions =
      await assignmentService.getAssignmentSubmissions(
        req.user.userId,
        assignmentId
      );

    return res.status(200).json({
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch submissions";

    if (message === "Assignment not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes(
        "do not have permission"
      )
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

export async function getSubmission(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const submissionId =
      req.params.id as string;

    const submission =
      await assignmentService.getSubmission(
        req.user.userId,
        submissionId
      );

    return res.status(200).json({
      message: "Submission fetched successfully",
      submission,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch submission";

    if (message === "Submission not found") {
      return res.status(404).json({
        message,
      });
    }

    if (
      message.includes(
        "do not have permission"
      )
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
