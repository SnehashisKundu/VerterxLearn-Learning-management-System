import { prisma } from "../../lib/prisma";
import type {
  CreateModuleInput,
  UpdateModuleInput,
} from "./mod.validation";

const checkCourseAccess = async (
  courseId: string,
  userId: string,
  role: string
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      instructorId: true,
      status: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Students can only access modules of published courses.
  if (role === "student" && course.status !== "published") {
    throw new Error("Course not found");
  }

  // Instructors can only manage modules of their own courses.
  if (
    role === "instructor" &&
    course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to access this course"
    );
  }

  return course;
};

export const createModule = async (
  courseId: string,
  userId: string,
  role: string,
  data: CreateModuleInput
) => {
  await checkCourseAccess(courseId, userId, role);

  const module = await prisma.module.create({
    data: {
      courseId,
      title: data.title,
      orderIndex: data.orderIndex,
    },
  });

  return module;
};

export const getModulesByCourse = async (
  courseId: string,
  userId: string,
  role: string
) => {
  await checkCourseAccess(courseId, userId, role);

  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    include: {
      _count: {
        select: {
          lectures: true,
          quizzes: true,
          flashcards: true,
        },
      },
    },
  });

  return modules;
};

export const getModuleById = async (
  moduleId: string,
  userId: string,
  role: string
) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: {
          id: true,
          instructorId: true,
          status: true,
        },
      },
      lectures: {
        orderBy: {
          orderIndex: "asc",
        },
      },
      _count: {
        select: {
          lectures: true,
          quizzes: true,
          flashcards: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (
    role === "student" &&
    module.course.status !== "published"
  ) {
    throw new Error("Module not found");
  }

  if (
    role === "instructor" &&
    module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to access this module"
    );
  }

  return module;
};

export const updateModule = async (
  moduleId: string,
  userId: string,
  role: string,
  data: UpdateModuleInput
) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: {
          instructorId: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (
    role === "instructor" &&
    module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to update this module"
    );
  }

  const updatedModule = await prisma.module.update({
    where: { id: moduleId },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),
      ...(data.orderIndex !== undefined && {
        orderIndex: data.orderIndex,
      }),
    },
  });

  return updatedModule;
};

export const deleteModule = async (
  moduleId: string,
  userId: string,
  role: string
) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: {
          instructorId: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (
    role === "instructor" &&
    module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to delete this module"
    );
  }

  await prisma.module.delete({
    where: { id: moduleId },
  });
};