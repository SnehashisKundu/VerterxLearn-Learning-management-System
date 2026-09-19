import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";

import {
  createRewardSchema,
  updateRewardSchema,
  rewardIdSchema,
  redemptionIdSchema,
  updateRedemptionStatusSchema,
  redemptionListQuerySchema,
} from "./rw.validation";

import {
  createReward,
  getActiveRewards,
  getAllRewards,
  getRewardById,
  updateReward,
  deleteReward,
  redeemReward,
  getMyRedemptions,
  getAllRedemptions,
  updateRedemptionStatus,
} from "./rw.service";

export const create = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = createRewardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Invalid request",
    });
  }

  const reward = await createReward({
    name: parsed.data.name,
    points: parsed.data.points,
    type: parsed.data.type,
    ...(parsed.data.description === undefined
      ? {}
      : { description: parsed.data.description }),
    ...(parsed.data.imageUrl === undefined
      ? {}
      : { imageUrl: parsed.data.imageUrl }),
    ...(parsed.data.isActive === undefined
      ? {}
      : { isActive: parsed.data.isActive }),
  });

  return res.status(201).json({
    success: true,
    message: "Reward created successfully",
    data: reward,
  });
};

export const getAll = async (
  req: AuthRequest,
  res: Response,
) => {
  const rewards = await getAllRewards();

  return res.status(200).json({
    success: true,
    message: "Rewards fetched successfully",
    data: rewards,
  });
};

export const getActive = async (
  req: AuthRequest,
  res: Response,
) => {
  const rewards = await getActiveRewards();

  return res.status(200).json({
    success: true,
    message: "Active rewards fetched successfully",
    data: rewards,
  });
};

export const getById = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = rewardIdSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid reward ID",
    });
  }

  const reward = await getRewardById(
    parsed.data.rewardId,
  );

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: "Reward not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Reward fetched successfully",
    data: reward,
  });
};

export const update = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsedParams = rewardIdSchema.safeParse(
    req.params,
  );

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid reward ID",
    });
  }

  const parsed = updateRewardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Invalid request",
    });
  }

  try {
    const updateData = {
      ...(parsed.data.name !== undefined && {
        name: parsed.data.name,
      }),

      ...(parsed.data.description !== undefined && {
        description: parsed.data.description,
      }),

      ...(parsed.data.imageUrl !== undefined && {
        imageUrl: parsed.data.imageUrl,
      }),

      ...(parsed.data.type !== undefined && {
        type: parsed.data.type,
      }),

      ...(parsed.data.points !== undefined && {
        points: parsed.data.points,
      }),

      ...(parsed.data.isActive !== undefined && {
        isActive: parsed.data.isActive,
      }),
    };

    const reward = await updateReward(
      parsedParams.data.rewardId,
      updateData,
    );

    return res.status(200).json({
      success: true,
      message: "Reward updated successfully",
      data: reward,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Reward not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = rewardIdSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid reward ID",
    });
  }

  try {
    const reward = await deleteReward(
      parsed.data.rewardId,
    );

    return res.status(200).json({
      success: true,
      message: "Reward deactivated successfully",
      data: reward,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Reward not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }
};

export const redeem = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = rewardIdSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid reward ID",
    });
  }

  const userId = req.user!.userId;

  try {
    const result = await redeemReward(
      userId,
      parsed.data.rewardId,
    );

    return res.status(200).json({
      success: true,
      message: "Reward redeemed successfully",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "Reward not found",
        "Reward is not active",
        "Insufficient points balance",
      ].includes(error.message)
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }
};

export const myRedemptions = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.userId;

  const redemptions = await getMyRedemptions(userId);

  return res.status(200).json({
    success: true,
    message: "Reward redemptions fetched successfully",
    data: redemptions,
  });
};

/*
 * ADMIN REDEMPTION MANAGEMENT
 */

export const adminRedemptions = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = redemptionListQuerySchema.safeParse(
    req.query,
  );

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Invalid query",
    });
  }

  const result = await getAllRedemptions(
    parsed.data.status,
    parsed.data.page,
    parsed.data.limit,
  );

  return res.status(200).json({
    success: true,
    message: "All reward redemptions fetched successfully",
    data: result,
  });
};

export const updateRedemption = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsedParams = redemptionIdSchema.safeParse(
    req.params,
  );

  if (!parsedParams.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid redemption ID",
    });
  }

  const parsedBody =
    updateRedemptionStatusSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message:
        parsedBody.error.issues[0]?.message ??
        "Invalid request",
    });
  }

  try {
    const result = await updateRedemptionStatus(
      parsedParams.data.redemptionId,
      parsedBody.data.status,
      {
        ...(parsedBody.data.trackingNumber !== undefined
          ? { trackingNumber: parsedBody.data.trackingNumber }
          : {}),
        ...(parsedBody.data.carrier !== undefined
          ? { carrier: parsedBody.data.carrier }
          : {}),
      },
    );

    return res.status(200).json({
      success: true,
      message: "Redemption status updated successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors = [
        "Redemption not found",
        "Invalid redemption status transition",
        "Only physical rewards can be shipped",
        "Tracking number and carrier are required when shipping a physical reward",
      ];

      if (knownErrors.includes(error.message)) {
        return res.status(
          error.message === "Redemption not found"
            ? 404
            : 400,
        ).json({
          success: false,
          message: error.message,
        });
      }
    }

    throw error;
  }
};