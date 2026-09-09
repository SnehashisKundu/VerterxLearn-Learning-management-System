import { prisma } from "../../lib/prisma";
import { CreateBookmarkInput } from "./bm.validation";

const getLectureForStudent = async (lectureId: string) => {
  const lecture = await prisma.lectures.findUnique({
    where: { id: lectureId },
    select: {
      id: true,
      title: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
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
    throw new Error("Lecture is not available");
  }

  return lecture;
};

const checkEnrollment = async (userId: string, courseId: string) => {
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

  return enrollment;
};

export const createBookmark = async (
  userId: string,
  lectureId: string,
  data: CreateBookmarkInput
) => {
  const lecture = await getLectureForStudent(lectureId);

  await checkEnrollment(userId, lecture.module.courseId);

  const bookmark = await prisma.bookmark.create({
    data: {
      userId,
      lectureId,
      timestampSeconds: data.timestampSeconds,
    },
  });

  return bookmark;
};

export const getLectureBookmarks = async (
  userId: string,
  lectureId: string
) => {
  const lecture = await getLectureForStudent(lectureId);

  await checkEnrollment(userId, lecture.module.courseId);

  return prisma.bookmark.findMany({
    where: {
      userId,
      lectureId,
    },
    orderBy: {
      timestampSeconds: "asc",
    },
  });
};

export const deleteBookmark = async (
  userId: string,
  bookmarkId: string
) => {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      id: bookmarkId,
    },
  });

  if (!bookmark) {
    throw new Error("Bookmark not found");
  }

  if (bookmark.userId !== userId) {
    throw new Error("You are not allowed to delete this bookmark");
  }

  await prisma.bookmark.delete({
    where: {
      id: bookmarkId,
    },
  });
};