import { prisma } from "../../lib/prisma";
import type {
  CreateBadgeInput,
  UpdateBadgeInput,
} from "./badge.validation";

export const createBadge = async (
  data: CreateBadgeInput,
) => {
  const existingBadge = await prisma.badge.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingBadge) {
    throw new Error("Badge already exists");
  }

  return prisma.badge.create({
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  });
};

export const getAllBadges = async () => {
  return prisma.badge.findMany({
    orderBy: {
      id: "asc",
    },
  });
};

export const getBadgeById = async (badgeId: number) => {
  const badge = await prisma.badge.findUnique({
    where: {
      id: badgeId,
    },
  });

  if (!badge) {
    throw new Error("Badge not found");
  }

  return badge;
};

export const updateBadge = async (
  badgeId: number,
  data: UpdateBadgeInput,
) => {
  const badge = await prisma.badge.findUnique({
    where: {
      id: badgeId,
    },
  });

  if (!badge) {
    throw new Error("Badge not found");
  }

  if (data.name !== undefined) {
    const existingBadge = await prisma.badge.findFirst({
      where: {
        name: data.name,
        NOT: {
          id: badgeId,
        },
      },
    });

    if (existingBadge) {
      throw new Error("Badge already exists");
    }
  }

  return prisma.badge.update({
    where: {
      id: badgeId,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
  });
};

export const deleteBadge = async (badgeId: number) => {
  const badge = await prisma.badge.findUnique({
    where: {
      id: badgeId,
    },
  });

  if (!badge) {
    throw new Error("Badge not found");
  }

  await prisma.badge.delete({
    where: {
      id: badgeId,
    },
  });
};

export const getUserBadges = async (userId: string) => {
  return prisma.userBadge.findMany({
    where: {
      userId,
    },
    orderBy: {
      earnedAt: "desc",
    },
    include: {
      badge: true,
    },
  });
};

export const awardBadge = async (
  userId: string,
  badgeId: number,
  moduleId: string,
) => {
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
  });

  if (!badge) {
    throw new Error("Badge not found");
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lectures: {
        select: {
          id: true,
          progress: {
            where: {
              enrollment: {
                userId,
              },
            },
            select: {
              completed: true,
            },
          },
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (module.lectures.length === 0) {
    throw new Error("Module has no lectures");
  }

  const allLecturesCompleted = module.lectures.every(
    (lecture) =>
      lecture.progress.length > 0 &&
      lecture.progress.every(
        (progress) => progress.completed === true,
      ),
  );

  if (!allLecturesCompleted) {
    throw new Error(
      "Complete all lectures in the module before earning this badge",
    );
  }

  const existingUserBadge =
    await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });

  if (existingUserBadge) {
    throw new Error("Badge already awarded");
  }

  return prisma.userBadge.create({
    data: {
      userId,
      badgeId,
    },
    include: {
      badge: true,
    },
  });
};