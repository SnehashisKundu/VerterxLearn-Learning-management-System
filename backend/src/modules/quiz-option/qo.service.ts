import { prisma } from "../../lib/prisma";
import type {
  CreateOptionInput,
  UpdateOptionInput,
} from "./qo.validation";

async function getQuestionWithAccess(questionId: string) {
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

  return question;
}

async function getOptionWithAccess(optionId: string) {
  const option = await prisma.quizOption.findUnique({
    where: { id: optionId },
    include: {
      question: {
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
      },
    },
  });

  if (!option) {
    throw new Error("Option not found");
  }

  return option;
}

function checkInstructorOwnership(
  userId: string,
  instructorId: string | null
) {
  if (instructorId !== userId) {
    throw new Error("You do not have access to this question");
  }
}

/**
 * Create option
 */
export async function createOption(
  userId: string,
  role: string,
  questionId: string,
  data: CreateOptionInput
) {
  const question = await getQuestionWithAccess(questionId);

  if (role === "instructor") {
    checkInstructorOwnership(
      userId,
      question.quiz.module.course.instructorId
    );
  } else if (role !== "admin") {
    throw new Error("You do not have permission to create options");
  }

  return prisma.quizOption.create({
    data: {
      questionId,
      optionText: data.optionText,
      isCorrect: data.isCorrect,
    },
    select: {
      id: true,
      questionId: true,
      optionText: true,
      isCorrect: true,
    },
  });
}

/**
 * Get all options
 */
export async function getQuestionOptions(
  userId: string,
  role: string,
  questionId: string
) {
  const question = await getQuestionWithAccess(questionId);

  if (role === "student") {
    if (question.quiz.module.course.status !== "published") {
      throw new Error("This question is not available");
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: question.quiz.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new Error("You are not enrolled in this course");
    }
  } else if (role === "instructor") {
    checkInstructorOwnership(
      userId,
      question.quiz.module.course.instructorId
    );
  } else if (role !== "admin") {
    throw new Error("You do not have permission to view options");
  }

  const options = await prisma.quizOption.findMany({
    where: {
      questionId,
    },
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      questionId: true,
      optionText: true,
      ...(role === "student" ? {} : { isCorrect: true }),
    },
  });

  return options;
}

/**
 * Update option
 */
export async function updateOption(
  userId: string,
  role: string,
  optionId: string,
  data: UpdateOptionInput
) {
  const option = await getOptionWithAccess(optionId);

  if (role === "instructor") {
    checkInstructorOwnership(
      userId,
      option.question.quiz.module.course.instructorId
    );
  } else if (role !== "admin") {
    throw new Error("You do not have permission to update options");
  }

  return prisma.quizOption.update({
    where: {
      id: optionId,
    },

    data: {
      ...(data.optionText !== undefined && {
        optionText: data.optionText,
      }),

      ...(data.isCorrect !== undefined && {
        isCorrect: data.isCorrect,
      }),
    },

    select: {
      id: true,
      questionId: true,
      optionText: true,
      isCorrect: true,
    },
  });
}

/**
 * Delete option
 */
export async function deleteOption(
  userId: string,
  role: string,
  optionId: string
) {
  const option = await getOptionWithAccess(optionId);

  if (role === "instructor") {
    checkInstructorOwnership(
      userId,
      option.question.quiz.module.course.instructorId
    );
  } else if (role !== "admin") {
    throw new Error("You do not have permission to delete options");
  }

  await prisma.quizOption.delete({
    where: {
      id: optionId,
    },
  });

  return {
    message: "Option deleted successfully",
  };
}