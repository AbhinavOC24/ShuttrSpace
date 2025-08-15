import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import imagekitRoutes from "./routes/imagekit.routes";

import authRoutes from "./routes/auth.routes";
import photoRoutes from "./routes/photo.routes";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

const isProd = process.env.NODE_ENV === "production";

let store;
if (isProd) {
  console.log("REDIS_URL from env:", process.env.REDIS_URL);
  console.log("Frontend URL from env:", process.env.FRONTEND_URL);

  const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: { tls: true }, // Upstash uses TLS for rediss://
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  (async () => {
    await redisClient.connect();
  })();

  store = new RedisStore({ client: redisClient });
}
console.log("origin", process.env.FRONTEND_URL);
console.log("isProd", isProd);

app.use(
  session({
    store: store || undefined, // MemoryStore in dev
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(` Listening on Port ${process.env.BACKEND_PORT}`);
});

app.get("/healthz", (req, res) => res.sendStatus(200));

app.use("/api/imagekit", imagekitRoutes);

app.use("/u/photo", photoRoutes);
app.use("/u/auth", authRoutes);
