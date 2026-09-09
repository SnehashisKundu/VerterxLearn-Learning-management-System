import { prisma } from "../../lib/prisma";
import {
  CreateQuizInput,
  UpdateQuizInput,
} from "./qz.validation";

const getModule = async (moduleId: string) => {
  const module = await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      courseId: true,
      course: {
        select: {
          status: true,
          instructorId: true,
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  return module;
};

const checkInstructorAccess = (
  userId: string,
  instructorId: string
) => {
  if (userId !== instructorId) {
    throw new Error("You are not allowed to manage this quiz");
  }
};

const checkStudentAccess = async (
  userId: string,
  courseId: string,
  status: string
) => {
  if (status !== "published") {
    throw new Error("Course is not available");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }
};

export const createQuiz = async (
  userId: string,
  role: string,
  moduleId: string,
  data: CreateQuizInput
) => {
  const module = await getModule(moduleId);

  if (role === "instructor") {
    checkInstructorAccess(
      userId,
      module.course.instructorId
    );
  }

  return prisma.quiz.create({
    data: {
      moduleId,
      title: data.title ?? null,
      isAiGenerated: data.isAiGenerated ?? false,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
};

export const getModuleQuizzes = async (
  userId: string,
  role: string,
  moduleId: string
) => {
  const module = await getModule(moduleId);

  if (role === "student") {
    await checkStudentAccess(
      userId,
      module.courseId,
      module.course.status
    );
  }

  if (role === "instructor") {
    checkInstructorAccess(
      userId,
      module.course.instructorId
    );
  }

  return prisma.quiz.findMany({
    where: {
      moduleId,
    },
    orderBy: {
      title: "asc",
    },
    include: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
        select: {
          id: true,
          questionText: true,
          questionType: true,
          difficulty: true,
          orderIndex: true,
          options: {
            select: {
              id: true,
              optionText: true,
              // IMPORTANT: don't expose isCorrect
            },
          },
        },
      },
    },
  });
};

export const getQuizById = async (
  userId: string,
  role: string,
  quizId: string
) => {
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      module: {
        select: {
          id: true,
          courseId: true,
          course: {
            select: {
              status: true,
              instructorId: true,
            },
          },
        },
      },
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
        select: {
          id: true,
          questionText: true,
          questionType: true,
          difficulty: true,
          orderIndex: true,
          options: {
            select: {
              id: true,
              optionText: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (role === "student") {
    await checkStudentAccess(
      userId,
      quiz.module.courseId,
      quiz.module.course.status
    );
  }

  if (role === "instructor") {
    checkInstructorAccess(
      userId,
      quiz.module.course.instructorId
    );
  }

  return quiz;
};

export const updateQuiz = async (
  userId: string,
  role: string,
  quizId: string,
  data: UpdateQuizInput
) => {
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      module: {
        select: {
          course: {
            select: {
              instructorId: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (role === "instructor") {
    checkInstructorAccess(
      userId,
      quiz.module.course.instructorId
    );
  }

  return prisma.quiz.update({
    where: {
      id: quizId,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),
    },
  });
};

export const deleteQuiz = async (
  userId: string,
  role: string,
  quizId: string
) => {
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      module: {
        select: {
          course: {
            select: {
              instructorId: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (role === "instructor") {
    checkInstructorAccess(
      userId,
      quiz.module.course.instructorId
    );
  }

  await prisma.quiz.delete({
    where: {
      id: quizId,
    },
  });
};