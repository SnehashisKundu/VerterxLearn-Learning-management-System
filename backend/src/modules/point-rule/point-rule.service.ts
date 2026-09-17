import { prisma } from "../../lib/prisma";

export interface CreatePointRuleInput {
  key: string;
  name: string;
  points: number;
  description?: string;
}

export interface UpdatePointRuleInput {
  name?: string;
  points?: number;
  description?: string;
  isActive?: boolean;
}

export const createPointRule = async (
  data: CreatePointRuleInput,
) => {
  const existingRule = await prisma.pointRule.findUnique({
    where: {
      key: data.key,
    },
  });

  if (existingRule) {
    throw new Error("Point rule with this key already exists");
  }

  return prisma.pointRule.create({
    data: {
      key: data.key,
      name: data.name,
      points: data.points,
      description: data.description ?? null,
    },
  });
};

export const getAllPointRules = async () => {
  return prisma.pointRule.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getPointRuleByKey = async (
  key: string,
) => {
  return prisma.pointRule.findUnique({
    where: {
      key,
    },
  });
};

export const updatePointRule = async (
  key: string,
  data: UpdatePointRuleInput,
) => {
  const existingRule = await prisma.pointRule.findUnique({
    where: {
      key,
    },
  });

  if (!existingRule) {
    throw new Error("Point rule not found");
  }

  return prisma.pointRule.update({
    where: {
      key,
    },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.points !== undefined && { points: data.points }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
};

export const deletePointRule = async (
  key: string,
) => {
  const existingRule = await prisma.pointRule.findUnique({
    where: {
      key,
    },
  });

  if (!existingRule) {
    throw new Error("Point rule not found");
  }

  return prisma.pointRule.delete({
    where: {
      key,
    },
  });
};