import { prisma } from "../../lib/prisma";

export const getWallet = async (userId: string) => {
  return prisma.pointWallet.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
      balance: 0,
    },
  });
};

export const earnPoints = async (
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string,
) => {
  return prisma.$transaction(async (tx) => {
    // Ensure wallet exists
    await tx.pointWallet.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
        balance: 0,
      },
    });

    const updatedWallet = await tx.pointWallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const transaction = await tx.pointTransaction.create({
      data: {
        userId,
        amount,
        type: "EARN",
        reason,
        referenceId: referenceId ?? null,
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });
};

export const adjustPoints = async (
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string,
) => {
  return prisma.$transaction(async (tx) => {
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

    if (wallet.balance + amount < 0) {
      throw new Error("Insufficient points balance");
    }

    const updatedWallet = await tx.pointWallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const transaction = await tx.pointTransaction.create({
      data: {
        userId,
        amount,
        type: "ADJUSTMENT",
        reason,
        referenceId: referenceId ?? null,
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });
};

export const getTransactions = async (userId: string) => {
  return prisma.pointTransaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};