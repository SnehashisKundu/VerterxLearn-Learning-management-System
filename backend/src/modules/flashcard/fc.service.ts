import { prisma } from "../../lib/prisma";
import type {
  CreateFlashcardInput,
  UpdateFlashcardInput,
} from "./fc.validation";

// --------------------------------------------------
// Module Access
// --------------------------------------------------

const checkModuleAccess = async (
  moduleId: string,
  userId: string,
  role: string,
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
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  // Students can only access modules
  // belonging to published courses.
  if (
    role === "student" &&
    module.course.status !== "published"
  ) {
    throw new Error("Module not found");
  }

  // Instructors can only manage flashcards
  // inside their own courses.
  if (
    role === "instructor" &&
    module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to access this module",
    );
  }

  return module;
};

// --------------------------------------------------
// Create Flashcard
// --------------------------------------------------

export const createFlashcard = async (
  moduleId: string,
  userId: string,
  role: string,
  data: CreateFlashcardInput,
) => {
  await checkModuleAccess(
    moduleId,
    userId,
    role,
  );

  const flashcard = await prisma.flashcard.create({
    data: {
      moduleId,
      front: data.front,
      back: data.back,
    },
  });

  return flashcard;
};

// --------------------------------------------------
// Get Flashcards By Module
// --------------------------------------------------

export const getFlashcardsByModule = async (
  moduleId: string,
  userId: string,
  role: string,
) => {
  await checkModuleAccess(
    moduleId,
    userId,
    role,
  );

  const flashcards = await prisma.flashcard.findMany({
    where: { moduleId },
    orderBy: {
      id: "asc",
    },
  });

  return flashcards;
};

// --------------------------------------------------
// Get Single Flashcard
// --------------------------------------------------

export const getFlashcardById = async (
  flashcardId: string,
  userId: string,
  role: string,
) => {
  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
    include: {
      module: {
        include: {
          course: {
            select: {
              instructorId: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  if (
    role === "student" &&
    flashcard.module.course.status !== "published"
  ) {
    throw new Error("Flashcard not found");
  }

  if (
    role === "instructor" &&
    flashcard.module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to access this flashcard",
    );
  }

  return flashcard;
};

// --------------------------------------------------
// Update Flashcard
// --------------------------------------------------

export const updateFlashcard = async (
  flashcardId: string,
  userId: string,
  role: string,
  data: UpdateFlashcardInput,
) => {
  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
    include: {
      module: {
        include: {
          course: {
            select: {
              instructorId: true,
            },
          },
        },
      },
    },
  });

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  if (
    role === "instructor" &&
    flashcard.module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to update this flashcard",
    );
  }

  const updatedFlashcard =
    await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        ...(data.front !== undefined && {
          front: data.front,
        }),
        ...(data.back !== undefined && {
          back: data.back,
        }),
      },
    });

  return updatedFlashcard;
};

// --------------------------------------------------
// Delete Flashcard
// --------------------------------------------------

export const deleteFlashcard = async (
  flashcardId: string,
  userId: string,
  role: string,
) => {
  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
    include: {
      module: {
        include: {
          course: {
            select: {
              instructorId: true,
            },
          },
        },
      },
    },
  });

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  if (
    role === "instructor" &&
    flashcard.module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to delete this flashcard",
    );
  }

  await prisma.flashcard.delete({
    where: { id: flashcardId },
  });
};