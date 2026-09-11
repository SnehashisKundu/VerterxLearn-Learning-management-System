import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  askTutor,
  generateTutorQuiz,
} from "./ai-tutor.service";

import {
  tutorAskSchema,
  tutorQuizSchema,
} from "./ai-tutor.validation";

export const ask = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const data = tutorAskSchema.parse(req.body);

    const result = await askTutor(data);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    console.error("AI tutor ask error:", error);

    return res.status(503).json({
      message:
        error instanceof Error
          ? error.message
          : "AI tutor service unavailable",
    });
  }
};

export const quiz = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const data = tutorQuizSchema.parse(req.body);

    const result = await generateTutorQuiz(data);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    console.error("AI tutor quiz error:", error);

    return res.status(503).json({
      message:
        error instanceof Error
          ? error.message
          : "AI tutor service unavailable",
    });
  }
};