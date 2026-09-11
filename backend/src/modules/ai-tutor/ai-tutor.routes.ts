import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { ask, quiz } from "./ai-tutor.controller";

const router = Router();

router.post("/ask", authenticate, ask);
router.post("/quiz", authenticate, quiz);

export default router;
