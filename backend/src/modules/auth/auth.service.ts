import bcrypt from "bcrypt";
import {
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

import { prisma } from "../../lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt";

import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.validation";

const SALT_ROUNDS = 12;

const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const hashPasswordResetToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const getRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 7);

  return expiresAt;
};

const getPasswordResetTokenExpiry = (): Date => {
  const expiresAt = new Date();

  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  return expiresAt;
};

const createRefreshToken = async (userId: string) => {
  const tokenId = randomUUID();

  const refreshToken = generateRefreshToken({
    userId,
    tokenId,
  });

  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = getRefreshTokenExpiry();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return refreshToken;
};

export const registerUser = async (data: RegisterInput) => {
  // 1. Check whether email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // 2. Find default Student role
  const studentRole = await prisma.role.findUnique({
    where: {
      name: "student",
    },
  });

  if (!studentRole) {
    throw new Error("Student role not found");
  }

  // 3. Hash password
  const passwordHash = await bcrypt.hash(
    data.password,
    SALT_ROUNDS
  );

  // 4. Create user and assign Student role
  const user = await prisma.user.create({
    data: {
      fullName: data.name,
      email: data.email,
      passwordHash,

      userRoles: {
        create: {
          roleId: studentRole.id,
        },
      },
    },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  // 5. Get assigned role
  const role = user.userRoles[0]?.role.name;

  if (!role) {
    throw new Error("Failed to assign user role");
  }

  // 6. Generate access token
  const accessToken = generateAccessToken({
    userId: user.id,
    role,
  });

  // 7. Create and store refresh token
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (data: LoginInput) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 2. Check whether account is active
  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  // 3. Compare password
  const passwordMatch = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // 4. Get user's role
  const role = user.userRoles[0]?.role.name;

  if (!role) {
    throw new Error("User role not found");
  }

  // 5. Generate access token
  const accessToken = generateAccessToken({
    userId: user.id,
    role,
  });

  // 6. Create and store refresh token
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (
  data: RefreshTokenInput
) => {
  // 1. Verify refresh JWT
  let payload;

  try {
    payload = verifyRefreshToken(data.refreshToken);
  } catch {
    throw new Error("Invalid refresh token");
  }

  // 2. Hash the incoming refresh token
  const tokenHash = hashRefreshToken(data.refreshToken);

  // 3. Find token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found");
  }

  // 4. Check whether token has been revoked
  if (storedToken.revokedAt) {
    throw new Error("Refresh token has been revoked");
  }

  // 5. Check token expiry
  if (storedToken.expiresAt <= new Date()) {
    throw new Error("Refresh token has expired");
  }

  // 6. Make sure token belongs to the same user
  if (storedToken.userId !== payload.userId) {
    throw new Error("Invalid refresh token");
  }

  // 7. Check whether user is active
  if (!storedToken.user.isActive) {
    throw new Error("User account is inactive");
  }

  // 8. Get current user role
  const role = storedToken.user.userRoles[0]?.role.name;

  if (!role) {
    throw new Error("User role not found");
  }

  // 9. Revoke old refresh token
  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // 10. Generate new access token
  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    role,
  });

  // 11. Generate and store new refresh token
  const refreshToken = await createRefreshToken(
    storedToken.user.id
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (
  data: RefreshTokenInput
) => {
  // 1. Hash incoming refresh token
  const tokenHash = hashRefreshToken(data.refreshToken);

  // 2. Find token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  // Token doesn't exist → already effectively logged out
  if (!storedToken) {
    return;
  }

  // 3. Revoke token
  if (!storedToken.revokedAt) {
    await prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
};

/* ============================================================
   PASSWORD RESET
   ============================================================ */

export const forgotPassword = async (
  data: ForgotPasswordInput
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  // Do not reveal whether an email exists.
  if (!user) {
    return;
  }

  // Invalidate any previous unused reset tokens.
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Generate secure random token.
  const rawToken = randomBytes(32).toString("hex");

  // Only store the hash in database.
  const tokenHash = hashPasswordResetToken(rawToken);

  const expiresAt = getPasswordResetTokenExpiry();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token: rawToken,
    email: user.email,
  };
};

export const resetPassword = async (
  data: ResetPasswordInput
) => {
  const tokenHash = hashPasswordResetToken(data.token);

  const resetToken =
    await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  // Token can only be used once.
  if (resetToken.usedAt) {
    throw new Error("Reset token has already been used");
  }

  // Token expires after 30 minutes.
  if (resetToken.expiresAt <= new Date()) {
    throw new Error("Reset token has expired");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: resetToken.userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  // Hash the new password.
  const passwordHash = await bcrypt.hash(
    data.newPassword,
    SALT_ROUNDS
  );

  const now = new Date();

  // Password reset + token invalidation + session revocation
  // happen together.
  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    }),

    prisma.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: now,
      },
    }),

    // Revoke all existing refresh sessions.
    prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    }),
  ]);

  return {
    message: "Password reset successfully",
  };
};