import { Router } from "express";
import {
  createProfile,
  getNonce,
  getProfile,
  verifySign,
} from "../controllers/auth.controller";

import { checkAuth } from "../middleware/checkAuth";
const router = Router();

router.post("/verifySign", verifySign);
router.post("/nonce", getNonce);
router.get("/getProfile", checkAuth, getProfile);
router.post("/createProfile", checkAuth, createProfile);
export default router;
