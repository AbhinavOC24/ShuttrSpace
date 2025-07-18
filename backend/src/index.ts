import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";

import authRoutes from "./routes/auth.routes";

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
      sameSite: "lax",
    }, // secure: true in prod (HTTPS)
  })
);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(` Listening on Port ${process.env.BACKEND_PORT}`);
});

app.use("/u/auth", authRoutes);
