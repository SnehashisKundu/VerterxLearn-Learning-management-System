import { prisma } from "../../lib/prisma";
import type {
  CreateLectureProgressInput,
  UpdateLectureProgressInput,
} from "./lp.validation";

const getLectureWithCourse = async (
  lectureId: string,
) => {
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

/*
 * Automatically award Module Master badge
 * when the student completes all lectures
 * inside a module.
 */
const checkAndAwardModuleBadge = async (
  moduleId: string,
  userId: string,
  enrollmentId: string,
) => {
  const totalLectures = await prisma.lectures.count({
    where: {
      moduleId,
    },
  });

  if (totalLectures === 0) {
    return;
  }

  const completedLectures =
    await prisma.lectureProgress.count({
      where: {
        enrollmentId,
        completed: true,
        lecture: {
          moduleId,
        },
      },
    });

  if (completedLectures !== totalLectures) {
    return;
  }

  const badge = await prisma.badge.findUnique({
    where: {
      name: "Module Master",
    },
  });

  if (!badge) {
    return;
  }

  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId,
        badgeId: badge.id,
      },
    },
    update: {},
    create: {
      userId,
      badgeId: badge.id,
    },
  });
};

export const createLectureProgress = async (
  lectureId: string,
  userId: string,
  data: CreateLectureProgressInput,
) => {
  const lecture =
    await getLectureWithCourse(lectureId);

  const enrollment =
    await getStudentEnrollment(
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

  const progress =
    await prisma.lectureProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lectureId,
        watchedSeconds: data.watchedSeconds,
        completed: data.completed,
        lastWatchedAt: new Date(),
      },
    });

  /*
   * If this lecture was completed,
   * check whether the entire module
   * has now been completed.
   */
  if (data.completed) {
    await checkAndAwardModuleBadge(
      lecture.module.id,
      userId,
      enrollment.id,
    );
  }

  return progress;
};

export const getLectureProgress = async (
  lectureId: string,
  userId: string,
) => {
  const lecture =
    await getLectureWithCourse(lectureId);

  const enrollment =
    await getStudentEnrollment(
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
    throw new Error(
      "Lecture progress not found",
    );
  }

  return progress;
};

export const updateLectureProgress = async (
  lectureId: string,
  userId: string,
  data: UpdateLectureProgressInput,
) => {
  const lecture =
    await getLectureWithCourse(lectureId);

  const enrollment =
    await getStudentEnrollment(
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
    throw new Error(
      "Lecture progress not found",
    );
  }

  const updatedProgress =
    await prisma.lectureProgress.update({
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

  /*
   * If the lecture has just been completed,
   * check whether the entire module
   * has now been completed.
   */
  if (data.completed === true) {
    await checkAndAwardModuleBadge(
      lecture.module.id,
      userId,
      enrollment.id,
    );
  }

  return updatedProgress;
};

export const getCourseProgress = async (
  courseId: string,
  userId: string,
) => {
  const enrollment =
    await prisma.enrollment.findUnique({
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

  const totalLectures =
    await prisma.lectures.count({
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