import { Router } from "express";
import {
  getNonce,
  verifyAuth,
  verifySign,
} from "../controllers/auth.controller";
import { checkAuth } from "../middleware/checkAuth";
const router = Router();

router.post("/nonce", getNonce);
router.post("/verifySign", checkAuth, verifySign);
router.get("/verifyAuth", checkAuth, verifyAuth);

export default router;
