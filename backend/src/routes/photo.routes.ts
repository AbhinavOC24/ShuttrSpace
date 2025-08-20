import { Router } from "express";
import { checkAuth, debugSession } from "../middleware/checkAuth";
import { check } from "zod";
import {
  getInfinitePhotos,
  getPhotos,
  uploadPhotos,
} from "../controllers/photo.controller";
const router = Router();

router.post("/uploadPhotos", checkAuth, uploadPhotos);
router.get("/getPhotos/:slug", getPhotos);
router.get("/getInfinitePhotos", getInfinitePhotos);
export default router;
