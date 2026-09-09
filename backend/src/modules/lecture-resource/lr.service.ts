import { prisma } from "../../lib/prisma";
import { CreateLectureResourceInput } from "./lr.validation";

const getLecture = async (lectureId: string) => {
  const lecture = await prisma.lectures.findUnique({
    where: {
      id: lectureId,
    },
    select: {
      id: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              status: true,
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

  return lecture;
};

const checkStudentAccess = async (
  userId: string,
  courseId: string,
  status: string
) => {
  if (status !== "published") {
    throw new Error("Lecture is not available");
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

const checkInstructorAccess = async (
  userId: string,
  instructorId: string
) => {
  if (userId !== instructorId) {
    throw new Error("You are not allowed to manage this resource");
  }
};

export const createLectureResource = async (
  userId: string,
  role: string,
  lectureId: string,
  data: CreateLectureResourceInput
) => {
  const lecture = await getLecture(lectureId);

  if (role === "student") {
    await checkStudentAccess(
      userId,
      lecture.module.courseId,
      lecture.module.course.status
    );
  } else if (role === "instructor") {
    await checkInstructorAccess(
      userId,
      lecture.module.course.instructorId
    );
  }

  return prisma.lectureResource.create({
    data: {
      lectureId,
      type: data.type,
      fileUrl: data.fileUrl,
      title: data.title ?? null,
    },
  });
};

export const getLectureResources = async (
  userId: string,
  role: string,
  lectureId: string
) => {
  const lecture = await getLecture(lectureId);

  if (role === "student") {
    await checkStudentAccess(
      userId,
      lecture.module.courseId,
      lecture.module.course.status
    );
  } else if (role === "instructor") {
    await checkInstructorAccess(
      userId,
      lecture.module.course.instructorId
    );
  }

  return prisma.lectureResource.findMany({
    where: {
      lectureId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const deleteLectureResource = async (
  userId: string,
  role: string,
  resourceId: string
) => {
  const resource = await prisma.lectureResource.findUnique({
    where: {
      id: resourceId,
    },
    select: {
      id: true,
      lecture: {
        select: {
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
      },
    },
  });

  if (!resource) {
    throw new Error("Resource not found");
  }

  if (role === "student") {
    throw new Error("Students cannot delete resources");
  }

  if (role === "instructor") {
    await checkInstructorAccess(
      userId,
      resource.lecture.module.course.instructorId
    );
  }

  await prisma.lectureResource.delete({
    where: {
      id: resourceId,
    },
  });
};