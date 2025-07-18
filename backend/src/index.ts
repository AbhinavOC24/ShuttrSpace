import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.listen(process.env.BACKEND_PORT, () => {
  console.log(` Listening on Port ${process.env.BACKEND_PORT}`);
});
