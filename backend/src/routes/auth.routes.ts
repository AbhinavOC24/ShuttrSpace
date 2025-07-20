import { Router } from "express";
import {
  checkSessionStatusAndGetSlug,
  createProfile,
  getNonce,
  getProfile,
  verifySign,
} from "../controllers/auth.controller";

import { checkAuth } from "../middleware/checkAuth";
const router = Router();

router.post("/verifySign", verifySign);
router.post("/nonce", getNonce);
router.post("/getProfile", getProfile);
router.get("/getSlug", checkAuth, checkSessionStatusAndGetSlug);

router.post("/createProfile", checkAuth, createProfile);
export default router;
