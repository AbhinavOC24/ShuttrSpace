import { Router } from "express";
import {
  getNonce,
  verifyAuth,
  verifySign,
} from "../controllers/auth.controller";

import { checkAuth } from "../middleware/checkAuth";
const router = Router();

router.post("/verifySign", verifySign);
router.post("/nonce", getNonce);
router.get("/verifyAuth", checkAuth, verifyAuth);

export default router;
