import { Response } from "express";
import { REFRESH_TOKEN_MAX_AGE_MS } from "../config/auth";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: REFRESH_TOKEN_MAX_AGE_MS,
} as const;

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refresh_token", {
    httpOnly: refreshTokenCookieOptions.httpOnly,
    secure: refreshTokenCookieOptions.secure,
    sameSite: refreshTokenCookieOptions.sameSite,
  });
};
