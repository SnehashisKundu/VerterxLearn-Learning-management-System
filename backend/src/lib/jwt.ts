import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

const normalizeExpiresIn = (
  value: string | number | undefined
): jwt.SignOptions["expiresIn"] | undefined => {
  if (value === undefined) return undefined;
  return value as jwt.SignOptions["expiresIn"];
};

const buildSignOptions = (
  expiresIn: string | number | undefined
): jwt.SignOptions => {
  const normalizedExpiresIn = normalizeExpiresIn(expiresIn);
  const options: jwt.SignOptions = {};

  if (normalizedExpiresIn !== undefined) {
    options.expiresIn = normalizedExpiresIn;
  }

  return options;
};

export const generateAccessToken = (
  payload: AccessTokenPayload
): string => {
  return jwt.sign(payload, env.jwtAccessSecret, buildSignOptions(env.jwtAccessExpiresIn));
};

export const generateRefreshToken = (
  payload: RefreshTokenPayload
): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, buildSignOptions(env.jwtRefreshExpiresIn));
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  return jwt.verify(
    token,
    env.jwtAccessSecret
  ) as unknown as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  return jwt.verify(
    token,
    env.jwtRefreshSecret
  ) as unknown as RefreshTokenPayload;
};