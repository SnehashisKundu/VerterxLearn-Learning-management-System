import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import * as idCardController from "./id-card.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("student"),
  idCardController.create
);

router.get(
  "/me",
  authenticate,
  authorize("student"),
  idCardController.getMyCard
);

export default router;