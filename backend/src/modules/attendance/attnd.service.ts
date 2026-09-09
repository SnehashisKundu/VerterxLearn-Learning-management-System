import { prisma } from "../../lib/prisma";

export async function createAttendanceSession(
  instructorId: string,
  courseId: string
) {
  // Verify instructor role
  const instructor = await prisma.user.findUnique({
    where: {
      id: instructorId,
    },
    select: {
      id: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!instructor) {
    throw new Error("Instructor not found");
  }

  const isInstructor =
    instructor.userRoles.some(
      (userRole) =>
        userRole.role.name === "instructor"
    );

  if (!isInstructor) {
    throw new Error(
      "Only instructors can create attendance sessions"
    );
  }

  // Verify course
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      instructorId: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Only course instructor can create session
  if (course.instructorId !== instructorId) {
    throw new Error(
      "You are not the instructor of this course"
    );
  }

  // Prevent multiple active sessions
  const existingSession =
    await prisma.attendanceSession.findFirst({
      where: {
        courseId,
        instructorId,
        endedAt: null,
      },
    });

  if (existingSession) {
    throw new Error(
      "An active attendance session already exists"
    );
  }

  return prisma.attendanceSession.create({
    data: {
      courseId,
      instructorId,
    },
    select: {
      id: true,
      courseId: true,
      instructorId: true,
      startedAt: true,
      endedAt: true,
    },
  });
}

export async function scanAttendance(
  instructorId: string,
  sessionId: string,
  qrToken: string
) {
  // Verify instructor
  const instructor = await prisma.user.findUnique({
    where: {
      id: instructorId,
    },
    select: {
      id: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!instructor) {
    throw new Error("Instructor not found");
  }

  const isInstructor =
    instructor.userRoles.some(
      (userRole) =>
        userRole.role.name === "instructor"
    );

  if (!isInstructor) {
    throw new Error(
      "Only instructors can scan attendance"
    );
  }

  // Find session
  const session =
    await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        courseId: true,
        instructorId: true,
        endedAt: true,
      },
    });

  if (!session) {
    throw new Error(
      "Attendance session not found"
    );
  }

  // Only session instructor can scan
  if (session.instructorId !== instructorId) {
    throw new Error(
      "You are not authorized for this attendance session"
    );
  }

  // Session must be active
  if (session.endedAt !== null) {
    throw new Error(
      "Attendance session is closed"
    );
  }

  // Find student ID card using QR token
  const studentCard =
    await prisma.studentIdCard.findUnique({
      where: {
        qrToken,
      },
      select: {
        userId: true,
      },
    });

  if (!studentCard) {
    throw new Error("Invalid QR token");
  }

  const studentId = studentCard.userId;

  // Verify student role
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const isStudent =
    student.userRoles.some(
      (userRole) =>
        userRole.role.name === "student"
    );

  if (!isStudent) {
    throw new Error(
      "QR does not belong to a student"
    );
  }

  // Student must be enrolled in the course
  const enrollment =
    await prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: session.courseId,
      },
      select: {
        id: true,
      },
    });

  if (!enrollment) {
    throw new Error(
      "Student is not enrolled in this course"
    );
  }

  // Prevent duplicate attendance
  const existingAttendance =
    await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    });

  if (existingAttendance) {
    throw new Error(
      "Attendance already marked"
    );
  }

  return prisma.attendance.create({
    data: {
      sessionId,
      studentId,
    },
    select: {
      id: true,
      sessionId: true,
      studentId: true,
      scannedAt: true,
    },
  });
}

export async function closeAttendanceSession(
  instructorId: string,
  sessionId: string
) {
  const session =
    await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        instructorId: true,
        endedAt: true,
      },
    });

  if (!session) {
    throw new Error(
      "Attendance session not found"
    );
  }

  if (session.instructorId !== instructorId) {
    throw new Error(
      "You are not authorized to close this session"
    );
  }

  if (session.endedAt !== null) {
    throw new Error(
      "Attendance session is already closed"
    );
  }

  return prisma.attendanceSession.update({
    where: {
      id: sessionId,
    },
    data: {
      endedAt: new Date(),
    },
    select: {
      id: true,
      courseId: true,
      instructorId: true,
      startedAt: true,
      endedAt: true,
    },
  });
}

export async function getAttendanceSession(
  instructorId: string,
  sessionId: string
) {
  const session =
    await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        courseId: true,
        instructorId: true,
        startedAt: true,
        endedAt: true,
        attendances: {
          select: {
            id: true,
            studentId: true,
            scannedAt: true,
          },
          orderBy: {
            scannedAt: "asc",
          },
        },
      },
    });

  if (!session) {
    throw new Error(
      "Attendance session not found"
    );
  }

  if (session.instructorId !== instructorId) {
    throw new Error(
      "You are not authorized to view this attendance session"
    );
  }

  return session;
}

export async function getMyAttendance(
  studentId: string
) {
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const isStudent = student.userRoles.some(
    (userRole) =>
      userRole.role.name === "student"
  );

  if (!isStudent) {
    throw new Error(
      "Only students can view their attendance"
    );
  }

  return prisma.attendance.findMany({
    where: {
      studentId,
    },
    select: {
      id: true,
      studentId: true,
      scannedAt: true,
      session: {
        select: {
          id: true,
          courseId: true,
          startedAt: true,
          endedAt: true,
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
      scannedAt: "desc",
    },
  });
}