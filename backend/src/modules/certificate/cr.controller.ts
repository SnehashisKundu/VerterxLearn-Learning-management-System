import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createCertificateSchema,
  certificateIdParamSchema,
} from "./cr.validation";

import {
  issueCertificate as issueCertificateService,
  getMyCertificates as getMyCertificatesService,
  getCertificateById as getCertificateByIdService,
} from "./cr.service";

const handleIssueCertificateError = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.issues,
    });
  }

  if (!(error instanceof Error)) {
    return undefined;
  }

  const notFoundErrors = [
    "Student not found",
    "Course not found",
    "You are not enrolled in this course",
    "No active certificate template found",
    "Certificate template not found",
  ];

  if (notFoundErrors.includes(error.message)) {
    return res.status(404).json({ message: error.message });
  }

  if (error.message === "Only students can receive certificates") {
    return res.status(403).json({ message: error.message });
  }

  if (error.message === "Course must be completed before issuing a certificate") {
    return res.status(400).json({ message: error.message });
  }

  if (error.message === "Certificate already exists") {
    return res.status(409).json({ message: error.message });
  }

  return undefined;
};

export const issueCertificate = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const data =
      createCertificateSchema.parse(req.body);

    const certificate =
      await issueCertificateService(
        req.user.userId,
        data.courseId,
        data.templateId,
      );

    return res.status(201).json({
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    const response = handleIssueCertificateError(error, res);
    if (response) {
      return response;
    }

    console.error(
      "Issue certificate error:",
      error,
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMyCertificates = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const certificates =
      await getMyCertificatesService(
        req.user.userId,
      );

    return res.status(200).json({
      message:
        "Certificates fetched successfully",
      certificates,
    });
  } catch (error) {
    console.error(
      "Get my certificates error:",
      error,
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCertificateById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { certificateId } =
      certificateIdParamSchema.parse(req.params);

    const certificate =
      await getCertificateByIdService(
        req.user.userId,
        certificateId,
      );

    return res.status(200).json({
      message:
        "Certificate fetched successfully",
      certificate,
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
        error.message ===
          "Certificate not found" ||
        error.message ===
          "You are not authorized to view this certificate"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
    }

    console.error(
      "Get certificate by ID error:",
      error,
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};