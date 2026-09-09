import { prisma } from "../../lib/prisma";
import type {
  CreateLectureProgressInput,
  UpdateLectureProgressInput,
} from "./lp.validation";

const getLectureWithCourse = async (lectureId: string) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      module: {
        select: {
          id: true,
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

const getStudentEnrollment = async (
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

export const createLectureProgress = async (
  lectureId: string,
  userId: string,
  data: CreateLectureProgressInput,
) => {
  const lecture = await getLectureWithCourse(lectureId);

  const enrollment = await getStudentEnrollment(
    userId,
    lecture.module.course.id,
  );

  const existingProgress =
    await prisma.lectureProgress.findUnique({
      where: {
        enrollmentId_lectureId: {
          enrollmentId: enrollment.id,
          lectureId,
        },
      },
    });

  if (existingProgress) {
    throw new Error(
      "Lecture progress already exists",
    );
  }

  return prisma.lectureProgress.create({
    data: {
      enrollmentId: enrollment.id,
      lectureId,
      watchedSeconds: data.watchedSeconds,
      completed: data.completed,
      lastWatchedAt: new Date(),
    },
  });
};

export const getLectureProgress = async (
  lectureId: string,
  userId: string,
) => {
  const lecture = await getLectureWithCourse(lectureId);

  const enrollment = await getStudentEnrollment(
    userId,
    lecture.module.course.id,
  );

  const progress =
    await prisma.lectureProgress.findUnique({
      where: {
        enrollmentId_lectureId: {
          enrollmentId: enrollment.id,
          lectureId,
        },
      },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            durationSeconds: true,
          },
        },
      },
    });

  if (!progress) {
    throw new Error("Lecture progress not found");
  }

  return progress;
};

export const updateLectureProgress = async (
  lectureId: string,
  userId: string,
  data: UpdateLectureProgressInput,
) => {
  const lecture = await getLectureWithCourse(lectureId);

  const enrollment = await getStudentEnrollment(
    userId,
    lecture.module.course.id,
  );

  const progress =
    await prisma.lectureProgress.findUnique({
      where: {
        enrollmentId_lectureId: {
          enrollmentId: enrollment.id,
          lectureId,
        },
      },
    });

  if (!progress) {
    throw new Error("Lecture progress not found");
  }

  return prisma.lectureProgress.update({
    where: {
      id: progress.id,
    },
    data: {
      ...(data.watchedSeconds !== undefined && {
        watchedSeconds: data.watchedSeconds,
      }),
      ...(data.completed !== undefined && {
        completed: data.completed,
      }),
      lastWatchedAt: new Date(),
    },
  });
};

export const getCourseProgress = async (
  courseId: string,
  userId: string,
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

  const totalLectures = await prisma.lectures.count({
    where: {
      module: {
        courseId,
      },
    },
  });

  const completedLectures =
    await prisma.lectureProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

  const progressPercent =
    totalLectures === 0
      ? 0
      : Number(
          (
            (completedLectures / totalLectures) *
            100
          ).toFixed(2),
        );

  await prisma.enrollment.update({
    where: {
      id: enrollment.id,
    },
    data: {
      progressPercent,
    },
  });

  return {
    courseId,
    enrollmentId: enrollment.id,
    totalLectures,
    completedLectures,
    progressPercent,
  };
};