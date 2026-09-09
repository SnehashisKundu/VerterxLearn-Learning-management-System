import type { Request, Response } from "express";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validation";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "./auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const data = await registerUser(result.data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (
      error instanceof Error &&
      error.message === "User with this email already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Student role not found"
    ) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const data = await loginUser(result.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (
      error instanceof Error &&
      error.message === "User account is inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "User role not found"
    ) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const refresh = async (
  req: Request,
  res: Response
) => {
  try {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const data = await refreshAccessToken(result.data);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error instanceof Error) {
      const clientErrors = [
        "Invalid refresh token",
        "Refresh token not found",
        "Refresh token has been revoked",
        "Refresh token has expired",
      ];

      if (clientErrors.includes(error.message)) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "User account is inactive") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "User role not found") {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
) => {
  try {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    await logoutUser(result.data);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  const result = await forgotPasswordService(req.body);

  res.status(200).json({
    message:
      "If an account exists with this email, a password reset link has been sent",
    ...(result && {
      resetToken: result.token,
    }),
  });
};

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  const result = await resetPasswordService(req.body);

  res.status(200).json(result);
};