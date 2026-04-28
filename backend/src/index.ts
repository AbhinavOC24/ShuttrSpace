import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import pool from "./lib/db";
import imagekit from "./lib/imagekit";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import { signupSchema, loginSchema, createUserProfileSchema, photoMetadataArraySchema } from "./lib/schemas";
import { initializeDatabase } from "./lib/db";
import { uploadQueue } from "./queue/uploadQueue";
import { authenticateToken } from "./middleware/auth";
import { authLimiter } from "./middleware/rateLimiters";
import { upload } from "./middleware/upload";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "./services/authService";
import { AuthRequest } from "./types/auth";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "./utils/authCookies";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post("/u/auth/signup", authLimiter, async (req: Request, res: Response) => {
  try {
    const signupInfo = signupSchema.safeParse(req.body);
    if (!signupInfo.success) return res.status(400).json({ error: signupInfo.error.issues[0].message });

    const { name, email, password } = signupInfo.data;

    const userCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = `${name.trim().toLowerCase().replace(/\s+/g, "_")}_${Math.random().toString(36).substring(2, 6)}`;

    const result = await pool.query(
      "INSERT INTO users (name, email, password, slug) VALUES ($1, $2, $3, $4) RETURNING id, slug",
      [name, email, hashedPassword, slug]
    );

    const newUser = result.rows[0];
    const accessToken = generateAccessToken({ id: newUser.id, email, slug: newUser.slug });
    const rawRefreshToken = await generateRefreshToken(newUser.id);

    setRefreshTokenCookie(res, rawRefreshToken);

    res.status(201).json({ message: "Signup successful", token: accessToken, slug: newUser.slug, hasProfile: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/u/auth/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const loginInfo = loginSchema.safeParse(req.body);
    if (!loginInfo.success) return res.status(400).json({ error: loginInfo.error.issues[0].message });

    const { email, password } = loginInfo.data;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

    const accessToken = generateAccessToken({ id: user.id, email, slug: user.slug });
    const rawRefreshToken = await generateRefreshToken(user.id);

    setRefreshTokenCookie(res, rawRefreshToken);

    res.json({ message: "Login successful", token: accessToken, slug: user.slug, hasProfile: !!user.bio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/u/auth/refresh", async (req: Request, res: Response) => {
  try {
    const rawRefreshToken = req.cookies.refresh_token;
    if (!rawRefreshToken) return res.status(401).json({ error: "No refresh token provided" });

    const hashedToken = hashRefreshToken(rawRefreshToken);
    const result = await pool.query(
      "SELECT id, user_id, is_revoked, expires_at FROM refresh_tokens WHERE hashed_token = $1",
      [hashedToken]
    );

    if (result.rows.length === 0) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const tokenData = result.rows[0];

    if (tokenData.is_revoked) {
      await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [tokenData.user_id]);
      clearRefreshTokenCookie(res);
      return res.status(403).json({ error: "Token reuse detected. All sessions revoked." });
    }

    if (new Date() > new Date(tokenData.expires_at)) {
      await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [tokenData.id]);
      clearRefreshTokenCookie(res);
      return res.status(403).json({ error: "Refresh token expired" });
    }

    await pool.query("UPDATE refresh_tokens SET is_revoked = true WHERE id = $1", [tokenData.id]);

    const userResult = await pool.query("SELECT email, slug FROM users WHERE id = $1", [tokenData.user_id]);
    const user = userResult.rows[0];

    const newAccessToken = generateAccessToken({ id: tokenData.user_id, email: user.email, slug: user.slug });
    const newRawRefreshToken = await generateRefreshToken(tokenData.user_id);

    setRefreshTokenCookie(res, newRawRefreshToken);

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not refresh token" });
  }
});

app.post("/u/auth/logout", async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies.refresh_token;
    if (rawToken) {
      const hashedToken = hashRefreshToken(rawToken);
      await pool.query("DELETE FROM refresh_tokens WHERE hashed_token = $1", [hashedToken]);
    }
  } catch (error) {
    console.error(error);
  }

  clearRefreshTokenCookie(res);
  res.json({ message: "Logout successful" });
});

app.get("/u/getProfile/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      "SELECT name, email, bio, profile_pic as \"profilePic\", location, birth_date as \"birthDate\", tags, slug, twitter, instagram, linkedin FROM users WHERE LOWER(slug) = LOWER($1)",
      [slug]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });

    res.json({ profile: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.get("/u/getSlug", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query("SELECT bio, slug FROM users WHERE id = $1", [req.user?.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json({
      authenticated: true,
      hasProfile: !!result.rows[0]?.bio,
      slug: result.rows[0].slug
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session status" });
  }
});

app.post("/u/createProfile", authenticateToken, upload.single("profilePic"), async (req: AuthRequest, res: Response) => {
  try {
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        req.body.tags = req.body.tags.split(',').map((t: string) => t.trim());
      }
    }

    const profileInfo = createUserProfileSchema.safeParse(req.body);
    if (!profileInfo.success) return res.status(400).json({ error: profileInfo.error.issues[0].message });

    const { bio, location, birthDate, tags, twitter, instagram, linkedin } = profileInfo.data;
    let { profilePic } = req.body;

    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `profile_${req.user?.slug}_${Date.now()}`,
        folder: "/profiles",
      });
      profilePic = uploadResponse.url;
    }

    await pool.query(
      "UPDATE users SET bio = $1, location = $2, birth_date = $3, tags = $4::jsonb, twitter = $5, instagram = $6, linkedin = $7, profile_pic = $8 WHERE id = $9",
      [bio || null, location || null, birthDate || null, JSON.stringify(tags || []), twitter || null, instagram || null, linkedin || null, profilePic || null, req.user?.id]
    );

    res.json({ message: "Profile created successfully", slug: req.user?.slug });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/u/updateProfile", authenticateToken, upload.single("profilePic"), async (req: AuthRequest, res: Response) => {
  try {
    const { bio, location, birthDate, socialLinks } = req.body;
    let { profilePic } = req.body;

    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `update_${req.user?.slug}_${Date.now()}`,
        folder: "/profiles",
      });
      profilePic = uploadResponse.url;
    }

    const { twitter, instagram, linkedin } = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks || {};

    await pool.query(
      `UPDATE users SET 
        bio = COALESCE($1, bio),
        location = COALESCE($2, location),
        birth_date = COALESCE($3, birth_date),
        profile_pic = COALESCE($4, profile_pic),
        twitter = COALESCE($5, twitter),
        instagram = COALESCE($6, instagram),
        linkedin = COALESCE($7, linkedin)
      WHERE id = $8`,
      [bio, location, birthDate, profilePic, twitter, instagram, linkedin, req.user?.id]
    );

    res.json({ success: true, message: "Profile updated successfully", profilePic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.get("/u/photo/uploadAuth", authenticateToken, (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.send({
    ...authParams,
    publicKey: process.env.IMAGEKIT_PUBLICKEY
  });
});

app.post("/u/photo/uploadPhotos", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { metadata, jobIds, slug } = req.body;

    if (!metadata || metadata.length === 0) {
      return res.status(400).json({ error: "No metadata provided" });
    }

    const metadataResult = photoMetadataArraySchema.safeParse(metadata);
    if (!metadataResult.success) {
      return res.status(400).json({
        error: "Invalid metadata provided",
        details: metadataResult.error.issues.map(i => i.message)
      });
    }

    const validMetadata = metadataResult.data;
    const parsedJobIds = jobIds || [];

    const incomingTags = Array.from(new Set(validMetadata.flatMap(meta => meta.tags || [])));
    if (incomingTags.length > 0) {

      const userResult = await pool.query("SELECT tags FROM users WHERE id = $1", [req.user?.id]);
      const currentTags = userResult.rows[0]?.tags || [];

      const mergedTags = Array.from(new Set([...currentTags, ...incomingTags]));

      await pool.query("UPDATE users SET tags = $1::jsonb WHERE id = $2", [JSON.stringify(mergedTags), req.user?.id]);
    }

    const batchId = req.body.batchId || randomUUID();

    const jobs = await Promise.all(validMetadata.map(async (meta, index) => {
      const jobId = parsedJobIds[index] || randomUUID();

      const photoResult = await pool.query(
        `INSERT INTO photos (title, tags, location, cameraname, iso, aperture, shutterspeed, lens, thumbnail_url, image_url, user_id, batch_id, status) 
         VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING id`,
        [
          meta.title || "Untitled",
          JSON.stringify(meta.tags || []),
          meta.location || "",
          meta.cameraDetails?.cameraname || "",
          meta.cameraDetails?.iso || "",
          meta.cameraDetails?.aperture || "",
          meta.cameraDetails?.shutterspeed || "",
          meta.cameraDetails?.lens || "",
          "",
          meta.imageUrl,
          req.user?.id,
          batchId,
          "pending"
        ]
      );

      const photoId = photoResult.rows[0].id;

      return {
        name: "uploadImage",
        data: {
          photoId,
          userId: req.user?.id,
          imageUrl: meta.imageUrl,
          metadata: meta,
        },
        opts: {
          jobId,
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false
        },
      };
    }));

    await uploadQueue.addBulk(jobs);
    return res.status(201).json({ message: "Uploading your Images", batchId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload photos" });
  }
});

app.get("/u/photo/status/:batchId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { batchId } = req.params;
    const result = await pool.query(
      "SELECT id, status FROM photos WHERE batch_id = $1 AND user_id = $2",
      [batchId, req.user?.id]
    );

    const photos = result.rows;
    if (photos.length === 0) return res.json({ allSettled: false, statuses: [] });

    const allSettled = photos.every((p) => p.status === "completed" || p.status === "failed");
    const allCompleted = photos.every((p) => p.status === "completed");
    const anyFailed = photos.some((p) => p.status === "failed");

    res.json({ allSettled, allCompleted, anyFailed, count: photos.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to check job status" });
  }
});

app.get("/u/photo/getPhotos/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userResult = await pool.query("SELECT id, email FROM users WHERE LOWER(slug) = LOWER($1)", [slug]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Profile not found" });

    const photosResult = await pool.query(
      `SELECT id, title, tags, thumbnail_url as "thumbnailUrl", image_url as "imageUrl", 
              location, cameraname, lens, aperture, iso, shutterspeed, status, batch_id, created_at as "createdAt"
       FROM photos WHERE user_id = $1 ORDER BY created_at DESC`,
      [userResult.rows[0].id]
    );

    res.json({ photos: photosResult.rows, uploaderEmail: userResult.rows[0].email });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.get("/u/photo/getInfinitePhotos", async (req: Request, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const result = await pool.query(
      `SELECT p.id, p.title, p.tags, p.thumbnail_url as "thumbnailUrl", p.image_url as "imageUrl", 
              p.location, p.cameraname, p.lens, p.aperture, p.iso, p.shutterspeed, p.created_at as "createdAt",
              u.name as "uploaderName", u.profile_pic as "uploaderProfilePic", u.slug as "uploaderSlug"
       FROM photos p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [take, skip]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch photos" });
  }
});

const PORT = process.env.BACKEND_PORT || 8000;

const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();

app.get("/health", (req, res) => res.sendStatus(200));
