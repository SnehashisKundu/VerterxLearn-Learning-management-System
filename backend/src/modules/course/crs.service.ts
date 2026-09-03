import { prisma } from "../../lib/prisma";

import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "./crs.validation";

export const createCourse = async (
  instructorId: string,
  data: CreateCourseInput
) => {
  const course = await prisma.course.create({
    data: {
      instructorId,
      title: data.title,
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.category !== undefined
        ? { category: data.category }
        : {}),
      ...(data.difficulty !== undefined
        ? { difficulty: data.difficulty }
        : {}),
      ...(data.thumbnailUrl !== undefined
        ? { thumbnailUrl: data.thumbnailUrl }
        : {}),
      price: data.price ?? 0,
      status: "pending",
    },
  });

  return course;
};

export const getCourses = async (role: string) => {
  const courses = await prisma.course.findMany({
    ...(role === "admin" || role === "instructor"
      ? {}
      : { where: { status: "published" } }),
    orderBy: {
      createdAt: "desc",
    },
    include: {
      instructor: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
  });

  return courses;
};

export const getCourseById = async (
  courseId: string,
  role: string
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructor: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      modules: {
        orderBy: {
          orderIndex: "asc",
        },
        include: {
          lectures: {
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
          assignments: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Students can only access published courses
  if (role === "student" && course.status !== "published") {
    throw new Error("Course not found");
  }

  return course;
};

export const updateCourse = async (
  courseId: string,
  userId: string,
  role: string,
  data: UpdateCourseInput
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Instructor can only update own course
  if (
    role === "instructor" &&
    course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to update this course"
    );
  }

  const updatedCourse = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.difficulty !== undefined
        ? { difficulty: data.difficulty }
        : {}),
      ...(data.thumbnailUrl !== undefined
        ? { thumbnailUrl: data.thumbnailUrl }
        : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
    },
  });

  return updatedCourse;
};

export const deleteCourse = async (
  courseId: string,
  userId: string,
  role: string
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Instructor can only delete own course
  if (
    role === "instructor" &&
    course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to delete this course"
    );
  }

  await prisma.course.delete({
    where: {
      id: courseId,
    },
  });
};