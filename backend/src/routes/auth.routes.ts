import { Router } from "express";
import {
  checkSessionStatusAndGetSlug,
  createProfile,
  getNonce,
  getProfile,
  verifySign,
  checkAuthStatus,
  updateProfilePic,
} from "../controllers/auth.controller";

import { checkAuth, debugSession } from "../middleware/checkAuth";
const router = Router();

router.post("/verifySign", verifySign);
router.post("/nonce", getNonce);
router.post("/getProfile", getProfile);
router.get("/getSlug", checkAuth, checkSessionStatusAndGetSlug);
router.post("/createProfile", debugSession, checkAuth, createProfile);
router.post("/updateProfilePic", checkAuth, updateProfilePic);
router.get("/checkAuthStatus", checkAuth, checkAuthStatus);

export default router;
