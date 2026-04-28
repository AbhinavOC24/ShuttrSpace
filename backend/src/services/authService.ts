import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../lib/db";
import { JWT_SECRET, REFRESH_TOKEN_MAX_AGE_MS } from "../config/auth";

export const hashRefreshToken = (rawToken: string) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

export const generateRefreshToken = async (userId: number) => {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const hashedToken = hashRefreshToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, hashed_token, expires_at) VALUES ($1, $2, $3)",
    [userId, hashedToken, expiresAt]
  );

  return rawToken;
};

export const generateAccessToken = (user: { id: number; email: string; slug: string }) =>
  jwt.sign(user, JWT_SECRET, { expiresIn: "15m" });
