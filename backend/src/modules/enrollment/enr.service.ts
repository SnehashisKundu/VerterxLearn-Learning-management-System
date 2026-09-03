import { prisma } from "../../lib/prisma";
import type { CreateEnrollmentInput } from "./enr.validation";

export const createEnrollment = async (
  userId: string,
  data: CreateEnrollmentInput,
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: data.courseId,
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error(
      "You can only enroll in published courses",
    );
  }

  const existingEnrollment =
    await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: data.courseId,
        },
      },
    });

  if (existingEnrollment) {
    throw new Error(
      "You are already enrolled in this course",
    );
  }

  return prisma.enrollment.create({
    data: {
      userId,
      courseId: data.courseId,
      progressPercent: 0,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });
};

export const getMyEnrollments = async (
  userId: string,
) => {
  return prisma.enrollment.findMany({
    where: {
      userId,
    },
    orderBy: {
      enrolledAt: "desc",
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          status: true,
        },
      },
    },
  });
};

export const getEnrollmentById = async (
  enrollmentId: string,
  userId: string,
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      id: enrollmentId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          status: true,
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  if (enrollment.userId !== userId) {
    throw new Error(
      "You do not have permission to access this enrollment",
    );
  }

  return enrollment;
};