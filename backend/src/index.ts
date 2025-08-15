import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import imagekitRoutes from "./routes/imagekit.routes";

import authRoutes from "./routes/auth.routes";
import photoRoutes from "./routes/photo.routes";
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax", // Important for cross-origin
    }, // secure: true in prod (HTTPS)
  })
);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(` Listening on Port ${process.env.BACKEND_PORT}`);
});

app.get("/healthz", (req, res) => res.sendStatus(200));

app.use("/api/imagekit", imagekitRoutes);

app.use("/u/photo", photoRoutes);
app.use("/u/auth", authRoutes);
