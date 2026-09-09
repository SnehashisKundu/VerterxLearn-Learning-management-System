import { prisma } from "../../lib/prisma";

export async function createCertificateTemplate(
  name: string,
  templateUrl: string
) {
  return prisma.certificateTemplate.create({
    data: {
      name,
      templateUrl,
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      templateUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getCertificateTemplates() {
  return prisma.certificateTemplate.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      templateUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function activateCertificateTemplate(
  templateId: string
) {
  const template =
    await prisma.certificateTemplate.findUnique({
      where: {
        id: templateId,
      },
    });

  if (!template) {
    throw new Error("Certificate template not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.certificateTemplate.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
}

export async function getActiveCertificateTemplate() {
  const template =
    await prisma.certificateTemplate.findFirst({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        templateUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  if (!template) {
    throw new Error(
      "No active certificate template found"
    );
  }

  return template;
}