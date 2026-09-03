import { prisma } from "../../lib/prisma";
import type {
  CreateLectureInput,
  UpdateLectureInput,
} from "./lec.validation";

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

  if (role === "student" && module.course.status !== "published") {
    throw new Error("Module not found");
  }

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

export const createLecture = async (
  moduleId: string,
  userId: string,
  role: string,
  data: CreateLectureInput,
) => {
  await checkModuleAccess(moduleId, userId, role);

  let videoUrl: string | null;
  if (data.videoUrl == null) {
    videoUrl = null;
  } else if (typeof data.videoUrl === "object") {
    videoUrl = JSON.stringify(data.videoUrl);
  } else {
    videoUrl = String(data.videoUrl);
  }

  return prisma.lectures.create({
    data: {
      moduleId,
      title: data.title,
      videoUrl,
      transcript: data.transcript ?? null,
      durationSeconds: data.durationSeconds ?? null,
      orderIndex: data.orderIndex,
      resourceUrls: data.resourceUrls ?? [],
    },
  });
};

export const getLecturesByModule = async (
  moduleId: string,
  userId: string,
  role: string,
) => {
  await checkModuleAccess(moduleId, userId, role);

  return prisma.lectures.findMany({
    where: {
      moduleId,
    },
    orderBy: {
      orderIndex: "asc",
    },
    include: {
      _count: {
        select: {
          progress: true,
          notes: true,
          bookmarks: true,
          documentChunks: true,
          resources: true,
          generatedQuizzes: true,
        },
      },
    },
  });
};

export const getLectureById = async (
  lectureId: string,
  userId: string,
  role: string,
) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
              instructorId: true,
              status: true,
            },
          },
        },
      },
      _count: {
        select: {
          progress: true,
          notes: true,
          bookmarks: true,
          documentChunks: true,
          resources: true,
          generatedQuizzes: true,
        },
      },
    },
  });

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  if (
    role === "student" &&
    lecture.module.course.status !== "published"
  ) {
    throw new Error("Lecture not found");
  }

  if (
    role === "instructor" &&
    lecture.module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to access this lecture",
    );
  }

  return lecture;
};

export const updateLecture = async (
  lectureId: string,
  userId: string,
  role: string,
  data: UpdateLectureInput,
) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      module: {
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

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  if (
    role === "instructor" &&
    lecture.module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to update this lecture",
    );
  }

  return prisma.lectures.update({
    where: {
      id: lectureId,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),
      ...(data.videoUrl !== undefined && {
        videoUrl: data.videoUrl,
      }),
      ...(data.transcript !== undefined && {
        transcript: data.transcript,
      }),
      ...(data.durationSeconds !== undefined && {
        durationSeconds: data.durationSeconds,
      }),
      ...(data.orderIndex !== undefined && {
        orderIndex: data.orderIndex,
      }),
      ...(data.resourceUrls !== undefined && {
        resourceUrls: data.resourceUrls,
      }),
    },
  });
};

export const deleteLecture = async (
  lectureId: string,
  userId: string,
  role: string,
) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    include: {
      module: {
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

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  if (
    role === "instructor" &&
    lecture.module.course.instructorId !== userId
  ) {
    throw new Error(
      "You do not have permission to delete this lecture",
    );
  }

  await prisma.lectures.delete({
    where: {
      id: lectureId,
    },
  });
};