import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

import type {
  CertificateLayout,
} from "./ct.validation";

/**
 * Creates a new certificate template.
 */
export async function createCertificateTemplate(
  name: string,
  templateUrl: string,
  layout?: CertificateLayout,
) {
  return prisma.certificateTemplate.create({
    data: {
      name,
      templateUrl,
      layout: layout ?? Prisma.JsonNull,
      isActive: false,
    },

    select: {
      id: true,
      name: true,
      templateUrl: true,
      layout: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Returns all certificate templates.
 */
export async function getCertificateTemplates() {
  return prisma.certificateTemplate.findMany({
    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      name: true,
      templateUrl: true,
      layout: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Activates exactly one certificate template.
 */
export async function activateCertificateTemplate(
  templateId: string,
) {
  const template =
    await prisma.certificateTemplate.findUnique({
      where: {
        id: templateId,
      },
    });

  if (!template) {
    throw new Error(
      "Certificate template not found",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      /**
       * Deactivate all templates first.
       */
      await tx.certificateTemplate.updateMany({
        where: {
          isActive: true,
        },

        data: {
          isActive: false,
        },
      });

      /**
       * Activate selected template.
       */
      return tx.certificateTemplate.update({
        where: {
          id: templateId,
        },

        data: {
          isActive: true,
        },

        select: {
          id: true,
          name: true,
          templateUrl: true,
          layout: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    },
  );
}

/**
 * Returns currently active certificate template.
 *
 * Returns null when no template is active.
 *
 * This is intentional because the certificate module
 * must fall back to the default local template.
 */
export async function getActiveCertificateTemplate() {
  return prisma.certificateTemplate.findFirst({
    where: {
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      templateUrl: true,
      layout: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}