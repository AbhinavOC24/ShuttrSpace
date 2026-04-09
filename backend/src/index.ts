import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import pool from "./lib/db";
import imagekit from "./lib/imagekit";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { signupSchema, loginSchema, createUserProfileSchema } from "./lib/schemas";
import { initializeDatabase } from "./lib/db";

dotenv.config();

/**
 *  EXPRESS SETUP
 */
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

/**
 *  AUTH MIDDLEWARE & UTILS
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP
  message: { error: "Too many auth requests, please try again later." }
});

const generateRefreshToken = async (userId: number) => {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  // 7 days expiry
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, hashed_token, expires_at) VALUES ($1, $2, $3)",
    [userId, hashedToken, expiresAt]
  );
  return rawToken;
};

/**
 *  AUTH MIDDLEWARE
 */
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    slug: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

/**
 *  MULTER SETUP (FOR BACKEND UPLOAD)
 */
const upload = multer({ storage: multer.memoryStorage() });

/**
 *  ROUTES - AUTH
 */

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
    const accessToken = jwt.sign({ id: newUser.id, email, slug: newUser.slug }, JWT_SECRET, { expiresIn: "15m" });
    const rawRefreshToken = await generateRefreshToken(newUser.id);

    res.cookie("refresh_token", rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

    const accessToken = jwt.sign({ id: user.id, email, slug: user.slug }, JWT_SECRET, { expiresIn: "15m" });
    const rawRefreshToken = await generateRefreshToken(user.id);

    res.cookie("refresh_token", rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

    const hashedToken = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const result = await pool.query(
      "SELECT id, user_id, is_revoked, expires_at FROM refresh_tokens WHERE hashed_token = $1",
      [hashedToken]
    );

    if (result.rows.length === 0) {
      // Token doesn't exist at all (or was completely deleted).
      res.clearCookie("refresh_token");
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const tokenData = result.rows[0];

    // Token Reuse Detection
    if (tokenData.is_revoked) {
      // 🚨 An old, revoked token was used. Possible credential compromise!
      await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [tokenData.user_id]);
      res.clearCookie("refresh_token");
      return res.status(403).json({ error: "Token reuse detected. All sessions revoked." });
    }

    // Expiry Check
    if (new Date() > new Date(tokenData.expires_at)) {
      await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [tokenData.id]);
      res.clearCookie("refresh_token");
      return res.status(403).json({ error: "Refresh token expired" });
    }

    // Valid: Rotate the token
    await pool.query("UPDATE refresh_tokens SET is_revoked = true WHERE id = $1", [tokenData.id]);
    
    // Get user details
    const userResult = await pool.query("SELECT email, slug FROM users WHERE id = $1", [tokenData.user_id]);
    const user = userResult.rows[0];

    // Issue New Tokens
    const newAccessToken = jwt.sign({ id: tokenData.user_id, email: user.email, slug: user.slug }, JWT_SECRET, { expiresIn: "15m" });
    const newRawRefreshToken = await generateRefreshToken(tokenData.user_id);

    res.cookie("refresh_token", newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
       const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
       await pool.query("DELETE FROM refresh_tokens WHERE hashed_token = $1", [hashedToken]);
    }
  } catch (error) {
    console.error(error);
  }
  
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: "Logout successful" });
});

app.get("/u/auth/getProfile/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      "SELECT name, email, bio, profile_pic as \"profilePic\", location, tags, slug FROM users WHERE LOWER(slug) = LOWER($1)",
      [slug]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });

    res.json({ profile: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.get("/u/auth/getSlug", authenticateToken, async (req: AuthRequest, res: Response) => {
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

app.post("/u/auth/createProfile", authenticateToken, upload.single("profilePic"), async (req: AuthRequest, res: Response) => {
  try {
    // If tags were sent as a JSON string (typical for FormData), parse them
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // Fallback for non-JSON strings
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

app.put("/u/auth/updateProfile", authenticateToken, upload.single("profilePic"), async (req: AuthRequest, res: Response) => {
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

/**
 *  ROUTES - PHOTOS & UPLOAD
 */

app.post("/u/photo/uploadPhotos", authenticateToken, upload.array("photos"), async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const metadata = JSON.parse(req.body.metadata || "[]");

    if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });

    const uploadedPhotos = await Promise.all(
      files.map(async (file, index) => {
        const meta = metadata[index] || {};
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: "/photos",
        });

        const insertResult = await pool.query(
          `INSERT INTO photos (title, tags, location, cameraname, iso, aperture, shutterspeed, lens, thumbnail_url, image_url, user_id) 
           VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
           RETURNING id, title, tags, thumbnail_url as "thumbnailUrl", image_url as "imageUrl", created_at as "createdAt"`,
          [
            meta.title || "Untitled",
            JSON.stringify(meta.tags || []),
            meta.location || "",
            meta.cameraDetails?.cameraname || "",
            meta.cameraDetails?.iso || "",
            meta.cameraDetails?.aperture || "",
            meta.cameraDetails?.shutterspeed || "",
            meta.cameraDetails?.lens || "",
            uploadResponse.url,
            uploadResponse.url,
            req.user?.id
          ]
        );
        return insertResult.rows[0];
      })
    );

    res.status(201).json({ photos: uploadedPhotos, message: "Uploaded Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload photos" });
  }
});

app.get("/u/photo/getPhotos/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userResult = await pool.query("SELECT id, email FROM users WHERE LOWER(slug) = LOWER($1)", [slug]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Profile not found" });

    const photosResult = await pool.query(
      `SELECT id, title, tags, thumbnail_url as "thumbnailUrl", image_url as "imageUrl", 
              location, cameraname, lens, aperture, iso, shutterspeed, created_at as "createdAt"
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
      `SELECT id, title, tags, thumbnail_url as "thumbnailUrl", image_url as "imageUrl", 
              location, cameraname, lens, aperture, iso, shutterspeed, created_at as "createdAt"
       FROM photos ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [take, skip]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch photos" });
  }
});

/**
 *  SERVER START
 */
const PORT = process.env.BACKEND_PORT || 8000;


const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();

app.get("/health", (req, res) => res.sendStatus(200));
