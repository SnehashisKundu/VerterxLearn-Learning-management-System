import { prisma } from "../../lib/prisma";

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const isSameDay = (a: Date, b: Date) => {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
};

const isYesterday = (lastDate: Date, currentDate: Date) => {
  const yesterday = startOfDay(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  return startOfDay(lastDate).getTime() === yesterday.getTime();
};

export const getMyStreak = async (userId: string) => {
  return prisma.streak.findUnique({
    where: {
      userId,
    },
  });
};

export const recordActivity = async (
  userId: string,
  activityDate?: Date,
) => {
  const date = startOfDay(activityDate ?? new Date());

  return prisma.$transaction(async (tx) => {
    const existing = await tx.streak.findUnique({
      where: {
        userId,
      },
    });

    // First activity
    if (!existing) {
      return tx.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveAt: date,
        },
      });
    }

    // Same day → don't increment twice
    if (
      existing.lastActiveAt &&
      isSameDay(existing.lastActiveAt, date)
    ) {
      return existing;
    }

    let currentStreak: number;

    // Consecutive day
    if (
      existing.lastActiveAt &&
      isYesterday(existing.lastActiveAt, date)
    ) {
      currentStreak = existing.currentStreak + 1;
    } else {
      // Gap → restart streak
      currentStreak = 1;
    }

    const longestStreak = Math.max(
      existing.longestStreak,
      currentStreak,
    );

    return tx.streak.update({
      where: {
        userId,
      },
      data: {
        currentStreak,
        longestStreak,
        lastActiveAt: date,
      },
    });
  });
};