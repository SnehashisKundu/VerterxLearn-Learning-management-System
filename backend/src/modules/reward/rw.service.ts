import { prisma } from "../../lib/prisma";

export interface CreateRewardInput {
  name: string;
  description?: string;
  imageUrl?: string;
  type: "DIGITAL" | "PHYSICAL";
  points: number;
  isActive?: boolean;
}

export interface UpdateRewardInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  type?: "DIGITAL" | "PHYSICAL";
  points?: number;
  isActive?: boolean;
}

export interface ShippingData {
  trackingNumber?: string;
  carrier?: string;
}

/*
 * CREATE REWARD
 */

export const createReward = async (
  data: CreateRewardInput,
) => {
  return prisma.reward.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      type: data.type,
      points: data.points,
      isActive: data.isActive ?? true,
    },
  });
};

/*
 * GET ACTIVE REWARDS
 */

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

/*
 * GET ALL REWARDS
 */

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

/*
 * GET REWARD BY ID
 */

export const getRewardById = async (
  rewardId: string,
) => {
  return prisma.reward.findUnique({
    where: {
      id: rewardId,
    },
  });
};

/*
 * UPDATE REWARD
 */

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
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.imageUrl !== undefined && {
        imageUrl: data.imageUrl,
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),

      ...(data.points !== undefined && {
        points: data.points,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
  });
};

/*
 * SOFT DELETE / DEACTIVATE REWARD
 */

export const deleteReward = async (
  rewardId: string,
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
      isActive: false,
    },
  });
};

/*
 * REDEEM REWARD
 */

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

/*
 * GET MY REDEMPTIONS
 */

export const getMyRedemptions = async (
  userId: string,
) => {
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

/*
 * ADMIN REDEMPTION MANAGEMENT
 */

export const getAllRedemptions = async (
  status?:
    | "PENDING"
    | "APPROVED"
    | "PROCESSING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CLAIMED"
    | "FULFILLED"
    | "CANCELLED",
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * limit;

  const where = status
    ? {
        status,
      }
    : {};

  const [redemptions, total] =
    await prisma.$transaction([
      prisma.rewardRedemption.findMany({
        where,
        include: {
          reward: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.rewardRedemption.count({
        where,
      }),
    ]);

  return {
    redemptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/*
 * UPDATE REDEMPTION STATUS
 *
 * DIGITAL:
 *
 * PENDING → APPROVED → FULFILLED
 *
 * PHYSICAL:
 *
 * PENDING
 *    ↓
 * APPROVED
 *    ↓
 * PROCESSING
 *    ↓
 * SHIPPED
 *    ↓
 * IN_TRANSIT
 *    ↓
 * DELIVERED
 *    ↓
 * CLAIMED
 *    ↓
 * FULFILLED
 *
 * Cancellation:
 *
 * PENDING / APPROVED / PROCESSING → CANCELLED
 *                               ↓
 *                           REFUND
 */

export const updateRedemptionStatus = async (
  redemptionId: string,
  newStatus:
    | "APPROVED"
    | "PROCESSING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CLAIMED"
    | "FULFILLED"
    | "CANCELLED",
  shippingData?: ShippingData,
) => {
  return prisma.$transaction(async (tx) => {
    const redemption =
      await tx.rewardRedemption.findUnique({
        where: {
          id: redemptionId,
        },
        include: {
          reward: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

    if (!redemption) {
      throw new Error("Redemption not found");
    }

    const currentStatus = redemption.status;

    /*
     * DIGITAL REWARD
     */

    if (redemption.reward.type === "DIGITAL") {
      const validTransitions: Record<
        string,
        string[]
      > = {
        PENDING: ["APPROVED", "CANCELLED"],
        APPROVED: ["FULFILLED", "CANCELLED"],
      };

      const allowed =
        validTransitions[currentStatus] ?? [];

      if (!allowed.includes(newStatus)) {
        throw new Error(
          "Invalid redemption status transition",
        );
      }
    }

    /*
     * PHYSICAL REWARD
     */

    if (redemption.reward.type === "PHYSICAL") {
      const validTransitions: Record<
        string,
        string[]
      > = {
        PENDING: ["APPROVED", "CANCELLED"],
        APPROVED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["IN_TRANSIT"],
        IN_TRANSIT: ["DELIVERED"],
        DELIVERED: ["CLAIMED"],
        CLAIMED: ["FULFILLED"],
      };

      const allowed =
        validTransitions[currentStatus] ?? [];

      if (!allowed.includes(newStatus)) {
        throw new Error(
          "Invalid redemption status transition",
        );
      }
    }

    /*
     * SHIPPING VALIDATION
     */

    if (newStatus === "SHIPPED") {
      if (redemption.reward.type !== "PHYSICAL") {
        throw new Error(
          "Only physical rewards can be shipped",
        );
      }

      if (
        !shippingData?.trackingNumber ||
        !shippingData?.carrier
      ) {
        throw new Error(
          "Tracking number and carrier are required when shipping a physical reward",
        );
      }
    }

    /*
     * CANCELLATION + REFUND
     */

    if (newStatus === "CANCELLED") {
      await tx.pointWallet.upsert({
        where: {
          userId: redemption.userId,
        },
        update: {},
        create: {
          userId: redemption.userId,
          balance: 0,
        },
      });

      const updatedWallet =
        await tx.pointWallet.update({
          where: {
            userId: redemption.userId,
          },
          data: {
            balance: {
              increment: redemption.points,
            },
          },
        });

      const refundTransaction =
        await tx.pointTransaction.create({
          data: {
            userId: redemption.userId,
            amount: redemption.points,
            type: "ADJUSTMENT",
            reason: `Reward redemption cancelled: ${redemption.reward.name}`,
            referenceId: redemption.id,
          },
        });

      const updatedRedemption =
        await tx.rewardRedemption.update({
          where: {
            id: redemption.id,
          },
          data: {
            status: "CANCELLED",
          },
          include: {
            reward: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

      return {
        redemption: updatedRedemption,
        wallet: updatedWallet,
        refundTransaction,
      };
    }

    /*
     * NORMAL STATUS UPDATE
     */

    const updateData: {
      status: typeof newStatus;
      trackingNumber?: string;
      carrier?: string;
      shippedAt?: Date;
      deliveredAt?: Date;
      claimedAt?: Date;
      fulfilledAt?: Date;
    } = {
      status: newStatus,
    };

    /*
     * SHIPPED
     */

    if (newStatus === "SHIPPED") {
      updateData.trackingNumber =
        shippingData!.trackingNumber!;

      updateData.carrier =
        shippingData!.carrier!;

      updateData.shippedAt = new Date();
    }

    /*
     * DELIVERED
     */

    if (newStatus === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    /*
     * CLAIMED
     */

    if (newStatus === "CLAIMED") {
      updateData.claimedAt = new Date();
    }

    /*
     * FULFILLED
     */

    if (newStatus === "FULFILLED") {
      updateData.fulfilledAt = new Date();
    }

    const updatedRedemption =
      await tx.rewardRedemption.update({
        where: {
          id: redemption.id,
        },
        data: updateData,
        include: {
          reward: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

    return {
      redemption: updatedRedemption,
    };
  });
};