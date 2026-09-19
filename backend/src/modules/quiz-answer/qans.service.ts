import { prisma } from "../../lib/prisma";
import type { CreateAnswerInput } from "./qans.validation";
import { recordActivity } from "../streak/str.service";

async function getAttempt(attemptId: string) {
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

async function getQuestion(questionId: string) {
  const question = await prisma.quizQuestion.findUnique({
    where: {
      id: questionId,
    },
    include: {
      options: true,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  return question;
}

/**
 * Create / update answer for an attempt
 */
export async function createAnswer(
  userId: string,
  attemptId: string,
  data: CreateAnswerInput
) {
  const attempt = await getAttempt(attemptId);

  if (attempt.userId !== userId) {
    throw new Error("You do not have access to this attempt");
  }

  if (attempt.submittedAt) {
    throw new Error("Quiz attempt has already been submitted");
  }

  const question = await getQuestion(data.questionId);

  // Question must belong to this quiz
  if (question.quizId !== attempt.quizId) {
    throw new Error(
      "Question does not belong to this quiz"
    );
  }

  // Selected options must belong to this question
  if (data.selectedOptionIds.length > 0) {
    const validOptions = await prisma.quizOption.findMany({
      where: {
        id: {
          in: data.selectedOptionIds,
        },
        questionId: data.questionId,
      },
      select: {
        id: true,
      },
    });

    if (
      validOptions.length !==
      new Set(data.selectedOptionIds).size
    ) {
      throw new Error(
        "One or more selected options are invalid"
      );
    }
  }

  // Backend calculates correctness
  let isCorrect: boolean | null;

  if (question.questionType === "text") {
    isCorrect = null;
  } else {
    const correctOptions = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
      .sort((a, b) => a.localeCompare(b));

    const selectedOptions = [
      ...new Set(data.selectedOptionIds),
    ].sort((a, b) => a.localeCompare(b));

    isCorrect =
      correctOptions.length === selectedOptions.length &&
      correctOptions.every(
        (id, index) => id === selectedOptions[index]
      );
  }

  // Prevent duplicate answer for same question
  const existingAnswer = await prisma.quizAnswer.findFirst({
    where: {
      attemptId,
      questionId: data.questionId,
    },
  });

  if (existingAnswer) {
    return prisma.quizAnswer.update({
      where: {
        id: existingAnswer.id,
      },
      data: {
        selectedOptionIds: data.selectedOptionIds,
        textAnswer: data.textAnswer ?? null,
        isCorrect,
      },
      select: {
        id: true,
        attemptId: true,
        questionId: true,
        selectedOptionIds: true,
        textAnswer: true,
        isCorrect: true,
      },
    });
  }

  return prisma.quizAnswer.create({
    data: {
      attemptId,
      questionId: data.questionId,
      selectedOptionIds: data.selectedOptionIds,
      textAnswer: data.textAnswer ?? null,
      isCorrect,
    },
    select: {
      id: true,
      attemptId: true,
      questionId: true,
      selectedOptionIds: true,
      textAnswer: true,
      isCorrect: true,
    },
  });
}

/**
 * Get answers for an attempt
 */
export async function getAttemptAnswers(
  userId: string,
  role: string,
  attemptId: string
) {
  const attempt = await getAttempt(attemptId);

  if (role === "student") {
    if (attempt.userId !== userId) {
      throw new Error(
        "You do not have access to this attempt"
      );
    }

    return prisma.quizAnswer.findMany({
      where: {
        attemptId,
      },
      orderBy: {
        questionId: "asc",
      },
      select: {
        id: true,
        attemptId: true,
        questionId: true,
        selectedOptionIds: true,
        textAnswer: true,
        isCorrect: true,
      },
    });
  }

  if (role === "instructor") {
    if (
      attempt.quiz.module.course.instructorId !== userId
    ) {
      throw new Error(
        "You do not have access to this attempt"
      );
    }

    return prisma.quizAnswer.findMany({
      where: {
        attemptId,
      },
      orderBy: {
        questionId: "asc",
      },
      select: {
        id: true,
        attemptId: true,
        questionId: true,
        selectedOptionIds: true,
        textAnswer: true,
        isCorrect: true,
      },
    });
  }

  if (role === "admin") {
    return prisma.quizAnswer.findMany({
      where: {
        attemptId,
      },
      orderBy: {
        questionId: "asc",
      },
      select: {
        id: true,
        attemptId: true,
        questionId: true,
        selectedOptionIds: true,
        textAnswer: true,
        isCorrect: true,
      },
    });
  }

  throw new Error(
    "You do not have permission to view answers"
  );
}

export async function submitAttempt(
  userId: string,
  attemptId: string
) {
  const attempt = await getAttempt(attemptId);

  // Ownership
  if (attempt.userId !== userId) {
    throw new Error("You do not have access to this attempt");
  }

  // Already submitted
  if (attempt.submittedAt) {
    throw new Error("Quiz attempt has already been submitted");
  }

  const answers = await prisma.quizAnswer.findMany({
    where: {
      attemptId,
    },
    select: {
      isCorrect: true,
    },
  });

  const totalQuestions = await prisma.quizQuestion.count({
    where: {
      quizId: attempt.quizId,
    },
  });

  if (totalQuestions === 0) {
    throw new Error("Quiz has no questions");
  }

  const correctAnswers = answers.filter(
    (answer) => answer.isCorrect === true
  ).length;

  const score =
    (correctAnswers / totalQuestions) * 100;

  const submittedAttempt =
    await prisma.quizAttempt.update({
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

  // Successful quiz submission counts as learning activity
  await recordActivity(userId);

  return {
    ...submittedAttempt,
    totalQuestions,
    correctAnswers,
  };
}