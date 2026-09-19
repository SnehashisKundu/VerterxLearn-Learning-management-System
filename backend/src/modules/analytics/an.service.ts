import { prisma } from "../../lib/prisma";

const toNumber = (
  value: unknown,
): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
};

const round = (
  value: number,
  decimals = 2,
): number => {
  return Number(value.toFixed(decimals));
};

/*
 * ================================
 * STUDENT ANALYTICS
 * ================================
 */

export const getStudentAnalytics = async (
  userId: string,
  courseId: string,
) => {
  const [
    enrollments,
    quizAttempts,
    assignmentSubmissions,
    badgeCount,
    streak,
  ] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        userId,
        courseId,
      },
      select: {
        id: true,
        courseId: true,
        progressPercent: true,
        enrolledAt: true,
        course: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    }),

    prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: {
          module: {
            courseId,
          },
        },
        submittedAt: {
          not: null,
        },
        score: {
          not: null,
        },
      },
      select: {
        id: true,
        quizId: true,
        score: true,
        startedAt: true,
        submittedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                courseId: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    }),

    prisma.assignmentSubmission.findMany({
      where: {
        userId,
        assignment: {
          courseId,
        },
      },
      select: {
        id: true,
        assignmentId: true,
        submittedAt: true,
        grade: true,
        assignment: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    }),

    prisma.userBadge.count({
      where: {
        userId,
      },
    }),

    prisma.streak.findUnique({
      where: {
        userId,
      },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    }),
  ]);

  /*
   * No enrollments
   */

  if (enrollments.length === 0) {
    return {
      summary: {
        enrolledCourses: 0,
        completedCourses: 0,
        overallProgress: 0,
        completedLectures: 0,
        totalLectures: 0,
        quizAttempts: quizAttempts.length,
        averageQuizScore: 0,
        assignmentsSubmitted:
          assignmentSubmissions.length,
        assignmentsGraded:
          assignmentSubmissions.filter(
            (submission) =>
              submission.grade !== null,
          ).length,
        averageAssignmentGrade: 0,
        badgesEarned: badgeCount,
        currentStreak:
          streak?.currentStreak ?? 0,
        longestStreak:
          streak?.longestStreak ?? 0,
        lastActiveAt:
          streak?.lastActiveAt ?? null,
      },
      courses: [],
    };
  }

  /*
   * Course IDs belonging to this student
   */

  const courseIds = enrollments.map(
    (enrollment) => enrollment.courseId,
  );

  /*
   * Course-wise certificates / achievements
   *
   * Certificate has courseId, so it can safely
   * be associated with a specific course.
   */

  const certificates =
    await prisma.certificate.findMany({
      where: {
        userId,
        courseId: {
          in: courseIds,
        },
      },
      select: {
        id: true,
        courseId: true,
        certificateUrl: true,
        issuedAt: true,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

  /*
   * Lecture statistics
   */

  const lectureProgress =
    await prisma.lectureProgress.findMany({
      where: {
        enrollmentId: {
          in: enrollments.map(
            (enrollment) => enrollment.id,
          ),
        },
      },
      select: {
        enrollmentId: true,
        lectureId: true,
        completed: true,
        watchedSeconds: true,
        lecture: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

  /*
   * Total lectures for enrolled courses
   */

  const totalLectures =
    await prisma.lectures.count({
      where: {
        module: {
          courseId: {
            in: courseIds,
          },
        },
      },
    });

  const completedLectures =
    lectureProgress.filter(
      (progress) => progress.completed,
    ).length;

  /*
   * Overall progress
   */

  const totalProgress = enrollments.reduce(
    (sum, enrollment) =>
      sum +
      toNumber(enrollment.progressPercent),
    0,
  );

  const overallProgress =
    enrollments.length === 0
      ? 0
      : round(
          totalProgress / enrollments.length,
        );

  const completedCourses =
    enrollments.filter(
      (enrollment) =>
        toNumber(
          enrollment.progressPercent,
        ) >= 100,
    ).length;

  /*
   * Quiz analytics
   */

  const quizScores = quizAttempts
    .map((attempt) => toNumber(attempt.score))
    .filter((score) => !Number.isNaN(score));

  const averageQuizScore =
    quizScores.length === 0
      ? 0
      : round(
          quizScores.reduce(
            (sum, score) => sum + score,
            0,
          ) / quizScores.length,
        );

  /*
   * Assignment analytics
   */

  const gradedAssignments =
    assignmentSubmissions.filter(
      (submission) =>
        submission.grade !== null,
    );

  const assignmentGrades =
    gradedAssignments.map((submission) =>
      toNumber(submission.grade),
    );

  const averageAssignmentGrade =
    assignmentGrades.length === 0
      ? 0
      : round(
          assignmentGrades.reduce(
            (sum, grade) => sum + grade,
            0,
          ) / assignmentGrades.length,
        );

  /*
   * Course-wise analytics
   */

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseLectureProgress =
        lectureProgress.filter(
          (progress) =>
            progress.enrollmentId ===
            enrollment.id,
        );

      const courseQuizAttempts =
        quizAttempts.filter(
          (attempt) =>
            attempt.quiz.module.courseId ===
            enrollment.courseId,
        );

      const courseAssignments =
        assignmentSubmissions.filter(
          (submission) =>
            submission.assignment.courseId ===
            enrollment.courseId,
        );

      /*
       * Course-wise certificates
       */

      const courseCertificates =
        certificates.filter(
          (certificate) =>
            certificate.courseId ===
            enrollment.courseId,
        );

      const courseQuizScores =
        courseQuizAttempts
          .map((attempt) =>
            toNumber(attempt.score),
          )
          .filter(
            (score) => !Number.isNaN(score),
          );

      const courseAverageQuizScore =
        courseQuizScores.length === 0
          ? 0
          : round(
              courseQuizScores.reduce(
                (sum, score) =>
                  sum + score,
                0,
              ) /
                courseQuizScores.length,
            );

      const courseAssignmentsGraded =
        courseAssignments.filter(
          (submission) =>
            submission.grade !== null,
        );

      const courseGrades =
        courseAssignmentsGraded.map(
          (submission) =>
            toNumber(submission.grade),
        );

      const courseAverageAssignmentGrade =
        courseGrades.length === 0
          ? 0
          : round(
              courseGrades.reduce(
                (sum, grade) =>
                  sum + grade,
                0,
              ) / courseGrades.length,
            );

      const courseTotalLectures =
        await prisma.lectures.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        });

      const courseCompletedLectures =
        courseLectureProgress.filter(
          (progress) => progress.completed,
        ).length;

      /*
       * Course achievements
       *
       * Currently certificate is the only
       * achievement that has a courseId.
       */

      const achievements =
        courseCertificates.map(
          (certificate) => ({
            type: "CERTIFICATE",
            id: certificate.id,
            courseId: certificate.courseId,
            certificateUrl:
              certificate.certificateUrl,
            earnedAt:
              certificate.issuedAt,
          }),
        );

      return {
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        courseStatus: enrollment.course.status,
        enrolledAt: enrollment.enrolledAt,

        progressPercent: round(
          toNumber(
            enrollment.progressPercent,
          ),
        ),

        completedLectures:
          courseCompletedLectures,

        totalLectures:
          courseTotalLectures,

        quizAttempts:
          courseQuizAttempts.length,

        averageQuizScore:
          courseAverageQuizScore,

        assignmentsSubmitted:
          courseAssignments.length,

        assignmentsGraded:
          courseAssignmentsGraded.length,

        averageAssignmentGrade:
          courseAverageAssignmentGrade,

        /*
         * Course-specific achievements
         */
        achievements,

        achievementCount:
          achievements.length,
      };
    }),
  );

  return {
    summary: {
      enrolledCourses: enrollments.length,
      completedCourses,
      overallProgress,
      completedLectures,
      totalLectures,

      quizAttempts:
        quizAttempts.length,

      averageQuizScore,

      assignmentsSubmitted:
        assignmentSubmissions.length,

      assignmentsGraded:
        gradedAssignments.length,

      averageAssignmentGrade,

      /*
       * Global badge count
       */
      badgesEarned: badgeCount,

      /*
       * Course-specific certificate count
       */
      certificatesEarned:
        certificates.length,

      currentStreak:
        streak?.currentStreak ?? 0,

      longestStreak:
        streak?.longestStreak ?? 0,

      lastActiveAt:
        streak?.lastActiveAt ?? null,
    },

    courses,
  };
};

/*
 * ================================
 * INSTRUCTOR ANALYTICS
 * ================================
 */

export const getInstructorAnalytics = async (
  instructorId: string,
) => {
  const courses = await prisma.course.findMany({
    where: {
      instructorId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,

      modules: {
        select: {
          id: true,
          title: true,
          orderIndex: true,

          lectures: {
            select: {
              id: true,
              title: true,
              orderIndex: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      },

      enrollments: {
        select: {
          id: true,
          userId: true,
          progressPercent: true,
        },
      },

      assignments: {
        select: {
          id: true,
          title: true,

          submissions: {
            select: {
              id: true,
              userId: true,
              grade: true,
              submittedAt: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  let totalStudents = 0;

  const courseAnalytics =
    await Promise.all(
      courses.map(async (course) => {
        const enrollments =
          course.enrollments;

        totalStudents += enrollments.length;

        const courseLectureIds =
          course.modules.flatMap(
            (module) =>
              module.lectures.map(
                (lecture) => lecture.id,
              ),
          );

        const lectureProgress =
          await prisma.lectureProgress.findMany({
            where: {
              lectureId: {
                in: courseLectureIds,
              },
            },
            select: {
              lectureId: true,
              enrollmentId: true,
              completed: true,
              watchedSeconds: true,
            },
          });

        const quizAttempts =
          await prisma.quizAttempt.findMany({
            where: {
              quiz: {
                module: {
                  courseId: course.id,
                },
              },
              submittedAt: {
                not: null,
              },
              score: {
                not: null,
              },
            },
            select: {
              id: true,
              userId: true,
              score: true,
              quizId: true,
            },
          });

        const quizScores = quizAttempts
          .map((attempt) =>
            toNumber(attempt.score),
          )
          .filter(
            (score) =>
              !Number.isNaN(score),
          );

        const averageQuizScore =
          quizScores.length === 0
            ? 0
            : round(
                quizScores.reduce(
                  (sum, score) =>
                    sum + score,
                  0,
                ) / quizScores.length,
              );

        const progressValues =
          enrollments.map((enrollment) =>
            toNumber(
              enrollment.progressPercent,
            ),
          );

        const averageProgress =
          progressValues.length === 0
            ? 0
            : round(
                progressValues.reduce(
                  (sum, progress) =>
                    sum + progress,
                  0,
                ) / progressValues.length,
              );

        const assignmentsSubmitted =
          course.assignments.reduce(
            (count, assignment) =>
              count +
              assignment.submissions.length,
            0,
          );

        const gradedSubmissions =
          course.assignments.flatMap(
            (assignment) =>
              assignment.submissions.filter(
                (submission) =>
                  submission.grade !== null,
              ),
          );

        const grades =
          gradedSubmissions.map(
            (submission) =>
              toNumber(submission.grade),
          );

        const averageAssignmentGrade =
          grades.length === 0
            ? 0
            : round(
                grades.reduce(
                  (sum, grade) =>
                    sum + grade,
                  0,
                ) / grades.length,
              );

        /*
         * Lecture-level drop-off analytics
         */

        const lectures =
          course.modules
            .flatMap((module) =>
              module.lectures.map(
                (lecture) => ({
                  ...lecture,
                  moduleId: module.id,
                  moduleTitle:
                    module.title,
                }),
              ),
            )
            .sort(
              (a, b) =>
                a.orderIndex -
                b.orderIndex,
            );

        const dropOff = lectures.map(
          (lecture, index) => {
            const progressForLecture =
              lectureProgress.filter(
                (progress) =>
                  progress.lectureId ===
                  lecture.id,
              );

            const completedStudents =
              new Set(
                progressForLecture
                  .filter(
                    (progress) =>
                      progress.completed,
                  )
                  .map(
                    (progress) =>
                      progress.enrollmentId,
                  ),
              ).size;

            const completionRate =
              enrollments.length === 0
                ? 0
                : round(
                    (completedStudents /
                      enrollments.length) *
                      100,
                  );

            const dropOffRate =
              enrollments.length === 0
                ? 0
                : round(
                    100 -
                      completionRate,
                  );

            const previousLecture =
              index > 0
                ? lectures[index - 1]
                : null;

            let sequentialDropOffRate = 0;

            if (previousLecture) {
              const previousProgress =
                lectureProgress.filter(
                  (progress) =>
                    progress.lectureId ===
                    previousLecture.id,
                );

              const previousCompleted =
                new Set(
                  previousProgress
                    .filter(
                      (progress) =>
                        progress.completed,
                    )
                    .map(
                      (progress) =>
                        progress.enrollmentId,
                    ),
                ).size;

              const previousCompletionRate =
                enrollments.length === 0
                  ? 0
                  : round(
                      (previousCompleted /
                        enrollments.length) *
                        100,
                    );

              sequentialDropOffRate =
                round(
                  Math.max(
                    0,
                    previousCompletionRate -
                      completionRate,
                  ),
                );
            }

            return {
              lectureId: lecture.id,
              lectureTitle:
                lecture.title,
              moduleId:
                lecture.moduleId,
              moduleTitle:
                lecture.moduleTitle,
              orderIndex:
                lecture.orderIndex,
              completedStudents,
              enrolledStudents:
                enrollments.length,
              completionRate,
              dropOffRate,
              sequentialDropOffRate,
            };
          },
        );

        return {
          courseId: course.id,
          courseTitle: course.title,
          status: course.status,

          students:
            enrollments.length,

          totalLectures:
            courseLectureIds.length,

          averageProgress,

          averageQuizScore,

          quizAttempts:
            quizAttempts.length,

          assignmentsSubmitted,

          assignmentsGraded:
            gradedSubmissions.length,

          averageAssignmentGrade,

          dropOff,
        };
      }),
    );

  return {
    summary: {
      totalCourses: courses.length,
      totalStudents,
    },

    courses: courseAnalytics,
  };
};