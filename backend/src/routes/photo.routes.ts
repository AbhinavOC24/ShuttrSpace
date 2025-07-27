import { Router } from "express";
import { checkAuth, debugSession } from "../middleware/checkAuth";
import { check } from "zod";
import { uploadPhotos } from "../controllers/photo.controller";
const router = Router();

router.post("/uploadPhotos", checkAuth, uploadPhotos);

export default router;
