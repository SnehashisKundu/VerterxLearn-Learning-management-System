import { prisma } from "../../lib/prisma";

export const getLearningRoadmap = async (
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
    throw new Error("You are not enrolled in this course");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      modules: {
        orderBy: {
          orderIndex: "asc",
        },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          lectures: {
            orderBy: {
              orderIndex: "asc",
            },
            select: {
              id: true,
              title: true,
              durationSeconds: true,
              orderIndex: true,
              progress: {
                where: {
                  enrollmentId: enrollment.id,
                },
                select: {
                  watchedSeconds: true,
                  completed: true,
                  lastWatchedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course || course.status !== "published") {
    throw new Error("Course not found");
  }

  const lectures = course.modules.flatMap((module) =>
    module.lectures.map((lecture) => ({
      id: lecture.id,
      title: lecture.title,
      durationSeconds: lecture.durationSeconds,
      orderIndex: lecture.orderIndex,
      moduleId: module.id,
      moduleTitle: module.title,
      completed: lecture.progress[0]?.completed ?? false,
      watchedSeconds:
        lecture.progress[0]?.watchedSeconds ?? 0,
      lastWatchedAt:
        lecture.progress[0]?.lastWatchedAt ?? null,
    })),
  );

  const completedLectures = lectures.filter(
    (lecture) => lecture.completed,
  );

  const totalLectures = lectures.length;

  const progressPercent =
    totalLectures === 0
      ? 0
      : Number(
          (
            (completedLectures.length / totalLectures) *
            100
          ).toFixed(2),
        );

  const currentIndex = lectures.findIndex(
    (lecture) => !lecture.completed,
  );

  const currentLecture =
    currentIndex === -1
      ? null
      : lectures[currentIndex];

  const nextLectures =
    currentIndex === -1
      ? []
      : lectures.slice(currentIndex + 1, currentIndex + 4);

  let message: string;

  if (totalLectures === 0) {
    message = "This course has no lectures yet.";
  } else if (currentLecture == null) {
    message =
      "Congratulations! You have completed this course.";
  } else {
    message =
      `Continue with "${currentLecture.title}" next.`;
  }

  return {
    courseId: course.id,
    courseTitle: course.title,
    progressPercent,
    totalLectures,
    completedLectures: completedLectures.length,
    currentLecture,
    nextLectures,
    message,
  };
};