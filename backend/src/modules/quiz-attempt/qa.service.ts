import { prisma } from "../../lib/prisma";
import { recordActivity } from "../streak/str.service";

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

/**
 * Check if a student has access to a quiz
 */
async function checkStudentQuizAccess(
  userId: string,
  quizId: string
) {
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

async function getAttemptWithRelations(attemptId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: {
      id: attemptId,
    },
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

  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  return attempt;
}

/**
 * Start a quiz attempt
 */
export async function createAttempt(
  userId: string,
  quizId: string
) {
  await checkStudentQuizAccess(userId, quizId);

  return prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
    },
    select: {
      id: true,
      quizId: true,
      userId: true,
      score: true,
      startedAt: true,
      submittedAt: true,
    },
  });
}

/**
 * Get student's attempts for a quiz
 */
export async function getQuizAttempts(
  userId: string,
  role: string,
  quizId: string
) {
  const quiz = await getQuizWithAccess(quizId);

  if (role === "student") {
    await checkStudentQuizAccess(userId, quizId);

    return prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId,
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        quizId: true,
        userId: true,
        score: true,
        startedAt: true,
        submittedAt: true,
      },
    });
  }

  if (role === "instructor") {
    if (quiz.module.course.instructorId !== userId) {
      throw new Error("You do not have access to this quiz");
    }

    return prisma.quizAttempt.findMany({
      where: {
        quizId,
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        quizId: true,
        userId: true,
        score: true,
        startedAt: true,
        submittedAt: true,
      },
    });
  }

  if (role === "admin") {
    return prisma.quizAttempt.findMany({
      where: {
        quizId,
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        quizId: true,
        userId: true,
        score: true,
        startedAt: true,
        submittedAt: true,
      },
    });
  }

  throw new Error("You do not have permission to view attempts");
}

/**
 * Get a single attempt
 */
export async function getAttemptById(
  userId: string,
  role: string,
  attemptId: string
) {
  const attempt = await getAttemptWithRelations(attemptId);

  if (role === "student") {
    if (attempt.userId !== userId) {
      throw new Error("You do not have access to this attempt");
    }

    if (attempt.quiz.module.course.status !== "published") {
      throw new Error("This quiz is not available");
    }

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    };
  }

  if (role === "instructor") {
    if (
      attempt.quiz.module.course.instructorId !== userId
    ) {
      throw new Error("You do not have access to this attempt");
    }

    return attempt;
  }

  if (role === "admin") {
    return attempt;
  }

  throw new Error("You do not have permission to view this attempt");
}

/**
 * Submit attempt
 *
 * Score calculation will be handled by QuizAnswer module.
 * This method only marks the attempt as submitted after
 * the score has been calculated and supplied internally.
 */
export async function submitAttempt(
  userId: string,
  attemptId: string,
  score: number
) {
  const attempt = await getAttemptWithRelations(attemptId);

  if (attempt.userId !== userId) {
    throw new Error("You do not have access to this attempt");
  }

  if (attempt.submittedAt) {
    throw new Error("Quiz attempt has already been submitted");
  }

  if (score < 0 || score > 100) {
    throw new Error("Invalid quiz score");
  }

  const updatedAttempt = await prisma.quizAttempt.update({
    where: {
      id: attemptId,
    },
    data: {
      score,
      submittedAt: new Date(),
    },
    select: {
      id: true,
      quizId: true,
      userId: true,
      score: true,
      startedAt: true,
      submittedAt: true,
    },
  });

  // Successful quiz submission counts as learning activity.
  await recordActivity(userId);

  return updatedAttempt;
}