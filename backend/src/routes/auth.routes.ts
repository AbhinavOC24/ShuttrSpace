import { Router } from "express";
import {
  getNonce,
  getProfile,
  verifySign,
} from "../controllers/auth.controller";

import { checkAuth } from "../middleware/checkAuth";
const router = Router();

router.post("/verifySign", verifySign);
router.post("/nonce", getNonce);
router.get("/getProfile", checkAuth, getProfile);

export default router;
