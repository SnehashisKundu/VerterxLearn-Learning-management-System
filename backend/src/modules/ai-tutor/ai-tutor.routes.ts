import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { ask, quiz, summary } from "./ai-tutor.controller";

const router = Router();

router.post("/ask", authenticate, ask);
router.post("/quiz", authenticate, quiz);
router.post("/summary", authenticate, summary);

export default router;
