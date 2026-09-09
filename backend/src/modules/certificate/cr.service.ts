import { prisma } from "../../lib/prisma";
import { generateCertificatePdf } from "./certificate.pdf";
import cloudinary from "../../lib/cloudinary";

export async function issueCertificate(
  userId: string,
  courseId: string,
  templateId?: string,
) {
  // --------------------------------------------------
  // Verify student
  // --------------------------------------------------

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("Student not found");
  }

  const isStudent = user.userRoles.some(
    (userRole) =>
      userRole.role.name === "student",
  );

  if (!isStudent) {
    throw new Error(
      "Only students can receive certificates",
    );
  }

  // --------------------------------------------------
  // Verify course
  // --------------------------------------------------

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // --------------------------------------------------
  // Verify enrollment
  // --------------------------------------------------

  const enrollment =
    await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
        progressPercent: true,
      },
    });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course",
    );
  }

  // --------------------------------------------------
  // Certificate eligibility
  // --------------------------------------------------

  if (
    Number(enrollment.progressPercent) < 100
  ) {
    throw new Error(
      "Course must be completed before issuing a certificate",
    );
  }

  // --------------------------------------------------
  // Prevent duplicate certificate
  // --------------------------------------------------

  const existingCertificate =
    await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

  if (existingCertificate) {
    throw new Error(
      "Certificate already exists",
    );
  }

  // --------------------------------------------------
  // Select certificate template
  //
  // templateId provided:
  //   → use selected custom template
  //
  // templateId not provided:
  //   → use local default template
  //
  // IMPORTANT:
  // isActive is NOT used here.
  // --------------------------------------------------

  let selectedTemplate: {
    id: string;
    name: string;
    templateUrl: string;
  } | null = null;

  if (templateId) {
    selectedTemplate =
      await prisma.certificateTemplate.findUnique({
        where: {
          id: templateId,
        },
        select: {
          id: true,
          name: true,
          templateUrl: true,
        },
      });

    if (!selectedTemplate) {
      throw new Error(
        "Certificate template not found",
      );
    }
  }

  // --------------------------------------------------
  // Create certificate
  //
  // Custom template:
  //   templateId = selected DB template ID
  //
  // Default template:
  //   templateId = null
  // --------------------------------------------------

  const certificate =
    await prisma.certificate.create({
      data: {
        userId,
        courseId,
        templateId:
          selectedTemplate?.id ?? null,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        templateId: true,
        certificateUrl: true,
        issuedAt: true,
      },
    });

  try {
    // --------------------------------------------------
    // Generate certificate PDF
    //
    // If selectedTemplate exists:
    //   certificate.pdf.ts receives templateUrl
    //
    // If no template was selected:
    //   certificate.pdf.ts receives undefined
    //   and automatically uses the default PNG.
    // --------------------------------------------------

    const pdfBuffer =
      await generateCertificatePdf({
        studentName: user.fullName,
        courseTitle: course.title,
        certificateId: certificate.id,
        issuedAt: certificate.issuedAt,
        templateUrl:
          selectedTemplate?.templateUrl ?? null,
      });

    // --------------------------------------------------
    // Upload generated PDF to Cloudinary
    // --------------------------------------------------

    const uploadResult =
      await new Promise<{
        secure_url: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                "vertex-lms/certificates",
              resource_type: "image",
              type: "upload",
              public_id: certificate.id,
              format: "pdf",
            },
            (error, result) => {
              if (error || !result) {
                const message =
                  error &&
                  typeof error === "object" &&
                  "message" in error
                    ? String(error.message)
                    : "Cloudinary returned no upload result";

                reject(
                  new Error(
                    `Certificate PDF upload failed: ${message}`,
                  ),
                );

                return;
              }

              resolve({
                secure_url:
                  result.secure_url,
              });
            },
          );

        uploadStream.on(
          "error",
          (error: Error) => {
            reject(
              new Error(
                `Certificate PDF upload stream failed: ${error.message}`,
              ),
            );
          },
        );

        uploadStream.end(pdfBuffer);
      });

    // --------------------------------------------------
    // Save Cloudinary URL
    // --------------------------------------------------

    const updatedCertificate =
      await prisma.certificate.update({
        where: {
          id: certificate.id,
        },
        data: {
          certificateUrl:
            uploadResult.secure_url,
        },
        select: {
          id: true,
          userId: true,
          courseId: true,
          templateId: true,
          certificateUrl: true,
          issuedAt: true,

          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },

          course: {
            select: {
              id: true,
              title: true,
            },
          },

          template: {
            select: {
              id: true,
              name: true,
              templateUrl: true,
            },
          },
        },
      });

    return updatedCertificate;
  } catch (error) {
    // --------------------------------------------------
    // Remove incomplete certificate if
    // PDF generation or upload fails
    // --------------------------------------------------

    await prisma.certificate.delete({
      where: {
        id: certificate.id,
      },
    });

    throw error;
  }
}

// --------------------------------------------------
// Get my certificates
// --------------------------------------------------

export async function getMyCertificates(
  userId: string,
) {
  const certificates =
    await prisma.certificate.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        templateId: true,
        certificateUrl: true,
        issuedAt: true,

        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },

        template: {
          select: {
            id: true,
            name: true,
            templateUrl: true,
          },
        },
      },

      orderBy: {
        issuedAt: "desc",
      },
    });

  return certificates;
}

// --------------------------------------------------
// Get certificate by ID
// --------------------------------------------------

export async function getCertificateById(
  userId: string,
  certificateId: string,
) {
  const certificate =
    await prisma.certificate.findUnique({
      where: {
        id: certificateId,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        templateId: true,
        certificateUrl: true,
        issuedAt: true,

        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },

        template: {
          select: {
            id: true,
            name: true,
            templateUrl: true,
          },
        },
      },
    });

  if (!certificate) {
    throw new Error(
      "Certificate not found",
    );
  }

  // --------------------------------------------------
  // Students can only view their own certificate
  // --------------------------------------------------

  if (certificate.userId !== userId) {
    throw new Error(
      "You are not authorized to view this certificate",
    );
  }

  return certificate;
}