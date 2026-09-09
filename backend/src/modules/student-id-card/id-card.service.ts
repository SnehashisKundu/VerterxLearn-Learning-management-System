import crypto from "node:crypto";
import QRCode from "qrcode";
import { prisma } from "../../lib/prisma";

export async function createStudentIdCard(
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
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
    (userRole) => userRole.role.name === "student"
  );

  if (!isStudent) {
    throw new Error(
      "Only students can have an ID card"
    );
  }

  const existingCard =
    await prisma.studentIdCard.findUnique({
      where: {
        userId,
      },
    });

  if (existingCard) {
    throw new Error(
      "Student ID card already exists"
    );
  }

  const cardNumber =
    `STU-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

  const qrToken =
    crypto.randomBytes(32).toString("hex");

  const card =
    await prisma.studentIdCard.create({
      data: {
        userId,
        cardNumber,
        qrToken,
      },
      select: {
        id: true,
        userId: true,
        cardNumber: true,
        qrToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  // Generate QR code from the secure token
  const qrCode = await QRCode.toDataURL(
    card.qrToken
  );

  return {
    ...card,
    qrCode,
  };
}

export async function getMyStudentIdCard(
  userId: string
) {
  const card =
    await prisma.studentIdCard.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        cardNumber: true,
        qrToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  if (!card) {
    throw new Error(
      "Student ID card not found"
    );
  }

  // Generate QR code from the existing token
  const qrCode = await QRCode.toDataURL(
    card.qrToken
  );

  return {
    ...card,
    qrCode,
  };
}