import { prisma } from "../../lib/prisma";
import { recordActivity } from "../streak/str.service";

import type {
  CreateAssignmentInput,
  SubmitAssignmentInput,
  GradeSubmissionInput,
} from "./asgn.validation";

export async function createAssignment(
  userId: string,
  data: CreateAssignmentInput
) {
  const course = await prisma.course.findUnique({
    where: {
      id: data.courseId,
    },
    select: {
      id: true,
      instructorId: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Instructor ownership check
  if (course.instructorId !== userId) {
    throw new Error(
      "You do not have permission to create an assignment for this course"
    );
  }

  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);

    if (dueDate <= new Date()) {
      throw new Error(
        "Due date must be in the future"
      );
    }
  }

  return prisma.assignment.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      instructions: data.instructions ?? null,
      ...(data.rubric !== undefined && { rubric: data.rubric }),
      dueDate: data.dueDate
        ? new Date(data.dueDate)
        : null,
    },
    select: {
      id: true,
      courseId: true,
      title: true,
      instructions: true,
      rubric: true,
      dueDate: true,
    },
  });
}

export async function submitAssignment(
  userId: string,
  assignmentId: string,
  data: SubmitAssignmentInput
) {
  const assignment =
    await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        courseId: true,
        dueDate: true,
      },
    });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Student must be enrolled in the course
  const enrollment =
    await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: assignment.courseId,
        },
      },
    });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course"
    );
  }

  // Deadline check
  if (
    assignment.dueDate &&
    new Date() > assignment.dueDate
  ) {
    throw new Error(
      "Assignment submission deadline has passed"
    );
  }

  // One submission per assignment per student
  const existingSubmission =
    await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
    });

  if (existingSubmission) {
    throw new Error(
      "You have already submitted this assignment"
    );
  }

  const submission =
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        userId,
        fileUrl: data.fileUrl,
      },
      select: {
        id: true,
        assignmentId: true,
        userId: true,
        fileUrl: true,
        submittedAt: true,
        grade: true,
        feedback: true,
      },
    });

  // Successful assignment submission counts as learning activity.
  await recordActivity(userId);

  return submission;
}

export async function getAssignment(
  userId: string,
  assignmentId: string
) {
  const assignment =
    await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        instructions: true,
        rubric: true,
        dueDate: true,
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Instructor who owns the course can view
  if (assignment.course.instructorId === userId) {
    return assignment;
  }

  // Student must be enrolled
  const enrollment =
    await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: assignment.courseId,
        },
      },
    });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course"
    );
  }

  return assignment;
}

export async function getAssignmentSubmissions(
  instructorId: string,
  assignmentId: string
) {
  const assignment =
    await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        courseId: true,
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (
    assignment.course.instructorId !== instructorId
  ) {
    throw new Error(
      "You do not have permission to view these submissions"
    );
  }

  return prisma.assignmentSubmission.findMany({
    where: {
      assignmentId,
    },
    orderBy: {
      submittedAt: "desc",
    },
    select: {
      id: true,
      assignmentId: true,
      userId: true,
      fileUrl: true,
      submittedAt: true,
      grade: true,
      feedback: true,
    },
  });
}

export async function gradeSubmission(
  instructorId: string,
  submissionId: string,
  data: GradeSubmissionInput
) {
  const submission =
    await prisma.assignmentSubmission.findUnique({
      where: {
        id: submissionId,
      },
      select: {
        id: true,
        assignment: {
          select: {
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (
    submission.assignment.course.instructorId !== instructorId
  ) {
    throw new Error(
      "You do not have permission to grade this submission"
    );
  }

  return prisma.assignmentSubmission.update({
    where: {
      id: submissionId,
    },
    data: {
      grade: data.grade,
      ...(data.feedback !== undefined && {
        feedback: data.feedback,
      }),
    },
    select: {
      id: true,
      assignmentId: true,
      userId: true,
      fileUrl: true,
      submittedAt: true,
      grade: true,
      feedback: true,
    },
  });
}

export async function getSubmission(
  userId: string,
  submissionId: string
) {
  const submission =
    await prisma.assignmentSubmission.findUnique({
      where: {
        id: submissionId,
      },
      include: {
        assignment: {
          select: {
            id: true,
            courseId: true,
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const isInstructor =
    submission.assignment.course.instructorId ===
    userId;

  const isOwner =
    submission.userId === userId;

  if (!isInstructor && !isOwner) {
    throw new Error(
      "You do not have permission to view this submission"
    );
  }

  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    userId: submission.userId,
    fileUrl: submission.fileUrl,
    submittedAt: submission.submittedAt,
    grade: submission.grade,
    feedback: submission.feedback,
  };
}