import { prisma } from "../../lib/prisma";
import type {
  CreateNoteInput,
  UpdateNoteInput,
} from "./note.validation";

const getLectureForStudent = async (lectureId: string) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      module: {
        select: {
          course: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  if (lecture.module.course.status !== "published") {
    throw new Error("Lecture not found");
  }

  return lecture;
};

const checkEnrollment = async (
  userId: string,
  courseId: string,
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course",
    );
  }

  return enrollment;
};

export const createNote = async (
  lectureId: string,
  userId: string,
  data: CreateNoteInput,
) => {
  const lecture = await getLectureForStudent(lectureId);

  await checkEnrollment(
    userId,
    lecture.module.course.id,
  );

  return prisma.note.create({
    data: {
      userId,
      lectureId,
      timestampSeconds: data.timestampSeconds ?? null,
      content: data.content,
    },
  });
};

export const getLectureNotes = async (
  lectureId: string,
  userId: string,
) => {
  const lecture = await getLectureForStudent(lectureId);

  await checkEnrollment(
    userId,
    lecture.module.course.id,
  );

  return prisma.note.findMany({
    where: {
      lectureId,
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateNote = async (
  noteId: string,
  userId: string,
  data: UpdateNoteInput,
) => {
  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  if (note.userId !== userId) {
    throw new Error(
      "You do not have permission to update this note",
    );
  }

  return prisma.note.update({
    where: {
      id: noteId,
    },
    data: {
      ...(data.timestampSeconds !== undefined && {
        timestampSeconds: data.timestampSeconds,
      }),
      ...(data.content !== undefined && {
        content: data.content,
      }),
    },
  });
};

export const deleteNote = async (
  noteId: string,
  userId: string,
) => {
  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  if (note.userId !== userId) {
    throw new Error(
      "You do not have permission to delete this note",
    );
  }

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });
};