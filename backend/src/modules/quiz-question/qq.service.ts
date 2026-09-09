import { prisma } from "../../lib/prisma";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "./qq.validation";

async function getQuizWithAccess(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  return quiz;
}

async function checkStudentAccess(userId: string, quizId: string) {
  const quiz = await getQuizWithAccess(quizId);

  if (quiz.module.course.status !== "published") {
    throw new Error("This quiz is not available");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: quiz.module.courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }

  return quiz;
}

async function checkInstructorAccess(userId: string, quizId: string) {
  const quiz = await getQuizWithAccess(quizId);

  if (quiz.module.course.instructorId !== userId) {
    throw new Error("You do not have access to this quiz");
  }

  return quiz;
}

/**
 * Create a question
 * Instructor/Admin only
 */
export async function createQuestion(
  userId: string,
  role: string,
  quizId: string,
  data: CreateQuestionInput
) {
  if (role === "instructor") {
    await checkInstructorAccess(userId, quizId);
  } else if (role === "admin") {
    await getQuizWithAccess(quizId);
  } else {
    throw new Error("You do not have permission to create questions");
  }

  return prisma.quizQuestion.create({
    data: {
      quizId,
      questionText: data.questionText,
      questionType: data.questionType,
      difficulty: data.difficulty,
      orderIndex: data.orderIndex,
    },
    select: {
      id: true,
      quizId: true,
      questionText: true,
      questionType: true,
      difficulty: true,
      orderIndex: true,
      options: {
        select: {
          id: true,
          optionText: true,
          isCorrect: true,
        },
      },
    },
  });
}

/**
 * Get all questions of a quiz
 */
export async function getQuizQuestions(
  userId: string,
  role: string,
  quizId: string
) {
  if (role === "student") {
    await checkStudentAccess(userId, quizId);
  } else if (role === "instructor") {
    await checkInstructorAccess(userId, quizId);
  } else if (role === "admin") {
    await getQuizWithAccess(quizId);
  } else {
    throw new Error("You do not have permission to view questions");
  }

  return prisma.quizQuestion.findMany({
    where: { quizId },
    orderBy: {
      orderIndex: "asc",
    },
    select: {
      id: true,
      quizId: true,
      questionText: true,
      questionType: true,
      difficulty: true,
      orderIndex: true,

      options: {
        select: {
          id: true,
          optionText: true,
          ...(role === "student" ? {} : { isCorrect: true }),
        },
      },
    },
  });
}

/**
 * Get single question
 */
export async function getQuestionById(
  userId: string,
  role: string,
  questionId: string
) {
  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    include: {
      quiz: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
      options: {
        select: {
          id: true,
          optionText: true,
          isCorrect: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const quiz = question.quiz;

  if (role === "student") {
    if (quiz.module.course.status !== "published") {
      throw new Error("This question is not available");
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: quiz.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new Error("You are not enrolled in this course");
    }

    return {
      ...question,
      options: question.options.map(({ isCorrect, ...option }) => option),
    };
  }

  if (role === "instructor") {
    if (quiz.module.course.instructorId !== userId) {
      throw new Error("You do not have access to this question");
    }

    return question;
  }

  if (role === "admin") {
    return question;
  }

  throw new Error("You do not have permission to view this question");
}

/**
 * Update question
 */
export async function updateQuestion(
  userId: string,
  role: string,
  questionId: string,
  data: UpdateQuestionInput
) {
  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    include: {
      quiz: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (role === "instructor") {
    if (question.quiz.module.course.instructorId !== userId) {
      throw new Error("You do not have access to this question");
    }
  } else if (role !== "admin") {
    throw new Error("You do not have permission to update questions");
  }

  return prisma.quizQuestion.update({
    where: { id: questionId },

    data: {
      ...(data.questionText !== undefined && {
        questionText: data.questionText,
      }),

      ...(data.questionType !== undefined && {
        questionType: data.questionType,
      }),

      ...(data.difficulty !== undefined && {
        difficulty: data.difficulty,
      }),

      ...(data.orderIndex !== undefined && {
        orderIndex: data.orderIndex,
      }),
    },

    select: {
      id: true,
      quizId: true,
      questionText: true,
      questionType: true,
      difficulty: true,
      orderIndex: true,
    },
  });
}

/**
 * Delete question
 */
export async function deleteQuestion(
  userId: string,
  role: string,
  questionId: string
) {
  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    include: {
      quiz: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (role === "instructor") {
    if (question.quiz.module.course.instructorId !== userId) {
      throw new Error("You do not have access to this question");
    }
  } else if (role !== "admin") {
    throw new Error("You do not have permission to delete questions");
  }

  await prisma.quizQuestion.delete({
    where: { id: questionId },
  });

  return {
    message: "Question deleted successfully",
  };
}