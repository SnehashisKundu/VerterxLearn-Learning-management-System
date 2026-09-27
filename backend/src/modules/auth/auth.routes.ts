import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from "./auth.controller";

const router = Router();

/* ============================================================
   REGISTER
   ============================================================ */

/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Register a new student'
  #swagger.description = 'Creates a new student account and returns access and refresh tokens.'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Snehashis Kundu"
            },
            email: {
              type: "string",
              format: "email",
              example: "student@example.com"
            },
            password: {
              type: "string",
              minLength: 8,
              maxLength: 100,
              format: "password",
              example: "Password@123"
            }
          }
        }
      }
    }
  }
  #swagger.responses[201] = {
    description: "User registered successfully",
    content: {
      "application/json": {
        example: {
          success: true,
          message: "User registered successfully",
          data: {
            user: {
              id: "cuid-user-id",
              fullName: "Snehashis Kundu",
              email: "student@example.com",
              role: "student"
            },
            accessToken: "eyJhbGciOiJIUzI1NiIs...",
            refreshToken: "eyJhbGciOiJIUzI1NiIs..."
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: "Validation failed"
  }
  #swagger.responses[409] = {
    description: "User with this email already exists"
  }
  #swagger.responses[500] = {
    description: "Internal server error"
  }
*/
router.post("/register", register);

/* ============================================================
   LOGIN
   ============================================================ */

/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Login user'
  #swagger.description = 'Authenticates a user and returns access and refresh tokens.'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "student@example.com"
            },
            password: {
              type: "string",
              format: "password",
              example: "Password@123"
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: "Login successful",
    content: {
      "application/json": {
        example: {
          success: true,
          message: "Login successful",
          data: {
            user: {
              id: "cuid-user-id",
              fullName: "Snehashis Kundu",
              email: "student@example.com",
              role: "student"
            },
            accessToken: "eyJhbGciOiJIUzI1NiIs...",
            refreshToken: "eyJhbGciOiJIUzI1NiIs..."
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: "Validation failed"
  }
  #swagger.responses[401] = {
    description: "Invalid email or password"
  }
  #swagger.responses[403] = {
    description: "User account is inactive"
  }
  #swagger.responses[500] = {
    description: "Internal server error"
  }
*/
router.post("/login", login);

/* ============================================================
   REFRESH TOKEN
   ============================================================ */

/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Refresh access token'
  #swagger.description = 'Revokes the current refresh token and generates a new access and refresh token pair.'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs..."
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: "Token refreshed successfully",
    content: {
      "application/json": {
        example: {
          success: true,
          message: "Token refreshed successfully",
          data: {
            accessToken: "eyJhbGciOiJIUzI1NiIs...",
            refreshToken: "eyJhbGciOiJIUzI1NiIs..."
          }
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: "Validation failed"
  }
  #swagger.responses[401] = {
    description: "Invalid, missing, revoked, or expired refresh token"
  }
  #swagger.responses[403] = {
    description: "User account is inactive"
  }
  #swagger.responses[500] = {
    description: "Internal server error"
  }
*/
router.post("/refresh", refresh);

/* ============================================================
   LOGOUT
   ============================================================ */

/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Logout user'
  #swagger.description = 'Revokes the supplied refresh token.'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs..."
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: "Logged out successfully",
    content: {
      "application/json": {
        example: {
          success: true,
          message: "Logged out successfully"
        }
      }
    }
  }
  #swagger.responses[400] = {
    description: "Validation failed"
  }
  #swagger.responses[500] = {
    description: "Internal server error"
  }
*/
router.post("/logout", logout);

/* ============================================================
   FORGOT PASSWORD
   ============================================================ */

/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Request password reset'
  #swagger.description = 'Requests a password reset token for the supplied email address.'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "student@example.com"
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: "Password reset request processed",
    content: {
      "application/json": {
        example: {
          message: "If an account exists with this email, a password reset link has been sent"
        }
      }
    }
  }
  #swagger.responses[500] = {
    description: "Internal server error"
  }
*/
router.post("/forgot-password", forgotPassword);

/* ============================================================
   RESET PASSWORD
   ============================================================ */

/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Reset password'
  #swagger.description = 'Resets the user password using a valid password reset token.'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: {
              type: "string",
              example: "a1b2c3d4e5f6..."
            },
            newPassword: {
              type: "string",
              minLength: 8,
              maxLength: 100,
              format: "password",
              example: "NewPassword@123"
            }
          }
        }
      }
    }
  }
  #swagger.responses[200] = {
    description: "Password reset successfully",
    content: {
      "application/json": {
        example: {
          message: "Password reset successfully"
        }
      }
    }
  }
  #swagger.responses[500] = {
    description: "Invalid, expired, or already used reset token"
  }
*/
router.post("/reset-password", resetPassword);

export default router;