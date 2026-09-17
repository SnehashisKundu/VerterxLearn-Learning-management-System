import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getRoadmap } from "./rd.controller";

const router = Router();

router.get(
  "/courses/:courseId/roadmap",
  authenticate,
  getRoadmap,
);

export default router;