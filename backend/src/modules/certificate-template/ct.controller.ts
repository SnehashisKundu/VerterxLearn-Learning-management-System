import { Request, Response } from "express";
import {
  activateCertificateTemplate,
  createCertificateTemplate,
  getActiveCertificateTemplate,
  getCertificateTemplates,
} from "./ct.service";

export async function create(
  req: Request,
  res: Response
) {
  const { name, templateUrl } = req.body;

  const template = await createCertificateTemplate(
    name,
    templateUrl
  );

  res.status(201).json({
    message: "Certificate template created successfully",
    template,
  });
}

export async function getAll(
  _req: Request,
  res: Response
) {
  const templates =
    await getCertificateTemplates();

  res.status(200).json({
    message:
      "Certificate templates fetched successfully",
    templates,
  });
}

export async function activate(
  req: Request,
  res: Response
) {
  const { templateId } = req.params;

  if (typeof templateId !== "string") {
    res.status(400).json({
      message: "A valid template ID is required",
    });
    return;
  }

  const template =
    await activateCertificateTemplate(templateId);

  res.status(200).json({
    message:
      "Certificate template activated successfully",
    template,
  });
}

export async function getActive(
  _req: Request,
  res: Response
) {
  const template =
    await getActiveCertificateTemplate();

  res.status(200).json({
    message:
      "Active certificate template fetched successfully",
    template,
  });
}