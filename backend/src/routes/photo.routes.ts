import { Router } from "express";
import { checkAuth, debugSession } from "../middleware/checkAuth";
import { check } from "zod";
import { getPhotos, uploadPhotos } from "../controllers/photo.controller";
const router = Router();

router.post("/uploadPhotos", checkAuth, uploadPhotos);
router.get("/getPhotos", checkAuth, getPhotos);
export default router;
