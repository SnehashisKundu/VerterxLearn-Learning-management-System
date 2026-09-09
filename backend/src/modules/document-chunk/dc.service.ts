import { prisma } from "../../lib/prisma";
import {
  CreateDocumentChunkInput,
  UpdateDocumentChunkInput,
} from "./dc.validation";

const getCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      status: true,
      instructorId: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

const checkInstructorAccess = async (
  userId: string,
  instructorId: string
) => {
  if (userId !== instructorId) {
    throw new Error("You are not allowed to manage this document chunk");
  }
};

const checkStudentAccess = async (
  userId: string,
  courseId: string,
  status: string
) => {
  if (status !== "published") {
    throw new Error("Course is not available");
  }

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
};

const validateLecture = async (
  lectureId: string,
  courseId: string
) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    select: {
      id: true,
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  if (lecture.module.courseId !== courseId) {
    throw new Error("Lecture does not belong to this course");
  }
};

export const createDocumentChunk = async (
  userId: string,
  role: string,
  courseId: string,
  data: CreateDocumentChunkInput
) => {
  const course = await getCourse(courseId);

  if (role === "instructor") {
    await checkInstructorAccess(userId, course.instructorId);
  }

  if (role === "admin") {
    // Admin has access to every course.
  }

  if (data.lectureId) {
    await validateLecture(data.lectureId, courseId);
  }

  return prisma.documentChunk.create({
    data: {
      courseId,
      lectureId: data.lectureId ?? null,
      content: data.content,
      chunkIndex: data.chunkIndex,
    },
  });
};

export const getCourseDocumentChunks = async (
  userId: string,
  role: string,
  courseId: string
) => {
  const course = await getCourse(courseId);

  if (role === "student") {
    await checkStudentAccess(
      userId,
      courseId,
      course.status
    );
  }

  if (role === "instructor") {
    await checkInstructorAccess(userId, course.instructorId);
  }

  return prisma.documentChunk.findMany({
    where: {
      courseId,
    },
    orderBy: {
      chunkIndex: "asc",
    },
  });
};

export const getDocumentChunkById = async (
  userId: string,
  role: string,
  chunkId: string
) => {
  const chunk = await prisma.documentChunk.findUnique({
    where: {
      id: chunkId,
    },
    include: {
      course: {
        select: {
          id: true,
          status: true,
          instructorId: true,
        },
      },
      lecture: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!chunk) {
    throw new Error("Document chunk not found");
  }

  if (role === "student") {
    await checkStudentAccess(
      userId,
      chunk.course.id,
      chunk.course.status
    );
  }

  if (role === "instructor") {
    await checkInstructorAccess(
      userId,
      chunk.course.instructorId
    );
  }

  return chunk;
};

export const updateDocumentChunk = async (
  userId: string,
  role: string,
  chunkId: string,
  data: UpdateDocumentChunkInput
) => {
  const chunk = await prisma.documentChunk.findUnique({
    where: {
      id: chunkId,
    },
    include: {
      course: {
        select: {
          instructorId: true,
        },
      },
    },
  });

  if (!chunk) {
    throw new Error("Document chunk not found");
  }

  if (role === "instructor") {
    await checkInstructorAccess(
      userId,
      chunk.course.instructorId
    );
  }

  if (role === "admin") {
    // Admin has access to every chunk.
  }

  return prisma.documentChunk.update({
    where: {
      id: chunkId,
    },
    data: {
      ...(data.content !== undefined && {
        content: data.content,
      }),
      ...(data.chunkIndex !== undefined && {
        chunkIndex: data.chunkIndex,
      }),
    },
  });
};

export const deleteDocumentChunk = async (
  userId: string,
  role: string,
  chunkId: string
) => {
  const chunk = await prisma.documentChunk.findUnique({
    where: {
      id: chunkId,
    },
    include: {
      course: {
        select: {
          instructorId: true,
        },
      },
    },
  });

  if (!chunk) {
    throw new Error("Document chunk not found");
  }

  if (role === "instructor") {
    await checkInstructorAccess(
      userId,
      chunk.course.instructorId
    );
  }

  if (role === "admin") {
    // Admin has access to every chunk.
  }

  await prisma.documentChunk.delete({
    where: {
      id: chunkId,
    },
  });
};