import { prisma } from "../../lib/prisma";

export interface CreateRewardInput {
  name: string;
  description?: string;
  imageUrl?: string;
  points: number;
  isActive?: boolean;
}

export interface UpdateRewardInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  points?: number;
  isActive?: boolean;
}

export const createReward = async (data: CreateRewardInput) => {
  return prisma.reward.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      points: data.points,
      isActive: data.isActive ?? true,
    },
  });
};

export const getActiveRewards = async () => {
  return prisma.reward.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      points: "asc",
    },
  });
};

export const getAllRewards = async () => {
  return prisma.reward.findMany({
    orderBy: [
      {
        points: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
};

export const getRewardById = async (rewardId: string) => {
  return prisma.reward.findUnique({
    where: {
      id: rewardId,
    },
  });
};

export const updateReward = async (
  rewardId: string,
  data: UpdateRewardInput,
) => {
  const existingReward = await prisma.reward.findUnique({
    where: {
      id: rewardId,
    },
  });

  if (!existingReward) {
    throw new Error("Reward not found");
  }

  return prisma.reward.update({
    where: {
      id: rewardId,
    },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.points !== undefined ? { points: data.points } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
};

export const deleteReward = async (rewardId: string) => {
  const existingReward = await prisma.reward.findUnique({
    where: {
      id: rewardId,
    },
  });

  if (!existingReward) {
    throw new Error("Reward not found");
  }

  // Soft delete: preserve redemption history.
  return prisma.reward.update({
    where: {
      id: rewardId,
    },
    data: {
      isActive: false,
    },
  });
};

export const redeemReward = async (
  userId: string,
  rewardId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({
      where: {
        id: rewardId,
      },
    });

    if (!reward) {
      throw new Error("Reward not found");
    }

    if (!reward.isActive) {
      throw new Error("Reward is not active");
    }

    const wallet = await tx.pointWallet.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
        balance: 0,
      },
    });

    if (wallet.balance < reward.points) {
      throw new Error("Insufficient points balance");
    }

    const updatedWallet = await tx.pointWallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          decrement: reward.points,
        },
      },
    });

    const transaction = await tx.pointTransaction.create({
      data: {
        userId,
        amount: -reward.points,
        type: "REDEEM",
        reason: `Redeemed reward: ${reward.name}`,
        referenceId: reward.id,
      },
    });

    const redemption = await tx.rewardRedemption.create({
      data: {
        userId,
        rewardId: reward.id,
        points: reward.points,
        status: "PENDING",
      },
      include: {
        reward: true,
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
      redemption,
    };
  });
};

export const getMyRedemptions = async (userId: string) => {
  return prisma.rewardRedemption.findMany({
    where: {
      userId,
    },
    include: {
      reward: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};